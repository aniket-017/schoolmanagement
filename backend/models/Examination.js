const mongoose = require("mongoose");

const examinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Examination name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["unit_test", "midterm", "final", "practical", "project", "assignment"],
      required: [true, "Examination type is required"],
    },

    // Academic Information
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: String,

    // Scheduling
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
    },
    venue: String,

    // Marks
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
    },
    passingMarks: {
      type: Number,
      required: [true, "Passing marks is required"],
    },

    // Instructions
    instructions: String,
    syllabus: String,
    allowedMaterials: [String],

    // Status
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },

    // Supervision
    invigilators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

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
examinationSchema.index({ classId: 1, examDate: 1 });
examinationSchema.index({ subjectId: 1, examDate: 1 });
examinationSchema.index({ examDate: 1 });
examinationSchema.index({ academicYear: 1 });

module.exports = mongoose.model("Examination", examinationSchema);
