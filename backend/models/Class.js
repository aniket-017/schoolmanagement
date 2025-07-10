const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    grade: {
      type: Number,
      required: [true, "Grade is required"],
      min: 1,
      max: 12,
    },
    division: {
      type: String,
      required: [true, "Division is required"],
      trim: true,
      uppercase: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Student Information
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxStudents: {
      type: Number,
      default: 40,
    },
    currentStrength: {
      type: Number,
      default: 0,
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

// Create compound index for unique class-division combination
classSchema.index({ grade: 1, division: 1, academicYear: 1 }, { unique: true });
classSchema.index({ academicYear: 1 });

// Virtual for full class name
classSchema.virtual("fullName").get(function () {
  return `${this.grade}${this.getOrdinalSuffix(this.grade)} Class - ${this.division}`;
});

// Helper method for ordinal suffix
classSchema.methods.getOrdinalSuffix = function (num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

module.exports = mongoose.model("Class", classSchema);
