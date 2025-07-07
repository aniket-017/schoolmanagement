const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
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
    attachments: [String],
    resources: [String],

    // Assessment
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
    },
    weightage: {
      type: Number, // percentage of total subject marks
      min: 0,
      max: 100,
    },

    // Submission Settings
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    latePenalty: {
      type: Number,
      default: 0,
      min: 0,
    },
    submissionFormat: {
      type: String,
      enum: ["file", "text", "both"],
      default: "both",
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
assignmentSchema.index({ classId: 1, dueDate: 1 });
assignmentSchema.index({ subjectId: 1, dueDate: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
