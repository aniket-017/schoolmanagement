const mongoose = require("mongoose");

const syllabusTrackingSchema = new mongoose.Schema(
  {
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

    // Content
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    chapter: String,
    unit: String,

    // Planning
    plannedDate: {
      type: Date,
      required: [true, "Planned date is required"],
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },

    // Completion
    completedDate: Date,
    actualHours: {
      type: Number,
      min: 0,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "delayed", "cancelled"],
      default: "planned",
    },

    // Teaching Methods
    teachingMethod: {
      type: String,
      enum: ["lecture", "practical", "demonstration", "project", "discussion", "group_work"],
    },
    resources: [String],

    // Assessment
    assessmentConducted: {
      type: Boolean,
      default: false,
    },
    studentFeedback: String,

    // Notes
    remarks: String,
    challenges: String,

    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: String,
  },
  {
    timestamps: true,
  }
);

// Update completion percentage and status
syllabusTrackingSchema.pre("save", function (next) {
  if (this.completedDate) {
    if (this.completionPercentage === 100) {
      this.status = "completed";
    } else if (this.completionPercentage > 0) {
      this.status = "in_progress";
    }
  }

  // Check if delayed
  if (this.status !== "completed" && this.plannedDate < new Date()) {
    this.status = "delayed";
  }

  next();
});

// Create indexes
syllabusTrackingSchema.index({ subjectId: 1, classId: 1 });
syllabusTrackingSchema.index({ teacherId: 1, academicYear: 1 });
syllabusTrackingSchema.index({ status: 1 });
syllabusTrackingSchema.index({ plannedDate: 1 });

module.exports = mongoose.model("SyllabusTracking", syllabusTrackingSchema);
