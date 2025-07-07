const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      enum: [
        "Mathematics",
        "Science",
        "English",
        "Social Studies",
        "Physical Education",
        "Arts",
        "Computer Science",
        "Languages",
      ],
    },
    credits: {
      type: Number,
      default: 1,
    },

    // Curriculum
    syllabus: {
      type: String,
    },
    textbooks: [String],
    references: [String],

    // Assessment
    totalMarks: {
      type: Number,
      default: 100,
    },
    passingMarks: {
      type: Number,
      default: 35,
    },
    assessmentPattern: {
      theory: {
        type: Number,
        default: 70,
      },
      practical: {
        type: Number,
        default: 30,
      },
      internal: {
        type: Number,
        default: 20,
      },
      external: {
        type: Number,
        default: 80,
      },
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
subjectSchema.index({ code: 1 });
subjectSchema.index({ name: 1 });
subjectSchema.index({ department: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
