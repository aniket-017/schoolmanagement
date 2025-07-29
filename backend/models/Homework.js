const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Homework title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Academic Information
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },

    // Dates
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Content
    instructions: String,
    resources: [String],

    // Status tracking for students
    studentProgress: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["assigned", "reading", "completed"],
        default: "assigned",
      },
      completedAt: Date,
      notes: String,
    }],

    // Visual settings
    color: {
      type: String,
      default: "#3B82F6", // Default blue
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
homeworkSchema.index({ classId: 1, dueDate: 1 });
homeworkSchema.index({ subjectId: 1, dueDate: 1 });
homeworkSchema.index({ teacherId: 1 });
homeworkSchema.index({ dueDate: 1 });
homeworkSchema.index({ "studentProgress.studentId": 1 });

// Virtual for getting days until due
homeworkSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for getting status
homeworkSchema.virtual('status').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  
  if (now > due) {
    return 'overdue';
  } else if (this.daysUntilDue <= 1) {
    return 'due_tomorrow';
  } else if (this.daysUntilDue <= 3) {
    return 'due_soon';
  } else {
    return 'assigned';
  }
});

module.exports = mongoose.model("Homework", homeworkSchema); 