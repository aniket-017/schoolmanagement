const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: [true, "Day is required"],
    },

    periods: [
      {
        periodNumber: {
          type: Number,
          required: true,
        },
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        room: String,
        type: {
          type: String,
          enum: ["theory", "practical", "lab", "sports", "library"],
          default: "theory",
        },
      },
    ],

    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: String,
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: Date,

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
timetableSchema.index({ classId: 1, day: 1 });
timetableSchema.index({ academicYear: 1 });
timetableSchema.index({ "periods.teacher": 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
