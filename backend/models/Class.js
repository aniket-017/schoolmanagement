const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      unique: true,
      trim: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Class teacher is required"],
    },
    // Academic Information
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        hoursPerWeek: Number,
      },
    ],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxStudents: {
      type: Number,
      default: 50,
    },
    currentStrength: Number,

    // Infrastructure
    classroom: String,
    building: String,
    floor: String,

    // Academic Calendar
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: String,
    // Schedule
    schedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        periods: [
          {
            subject: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Subject",
            },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            startTime: String,
            endTime: String,
            room: String,
            periodNumber: Number,
          },
        ],
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
classSchema.index({ name: 1 });
classSchema.index({ grade: 1, section: 1 });
classSchema.index({ academicYear: 1 });

module.exports = mongoose.model("Class", classSchema);
