const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Attendance Details
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "holiday", "leave"],
      required: [true, "Status is required"],
    },
    timeIn: String,
    timeOut: String,
    totalHours: Number,

    // For Students - Period-wise attendance
    periodWiseAttendance: [
      {
        period: {
          type: Number,
          required: true,
        },
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          required: true,
        },
      },
    ],

    // Tracking
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    attendanceType: {
      type: String,
      enum: ["daily", "period_wise"],
      default: "daily",
    },

    // Additional Information
    remarks: String,
    leaveType: {
      type: String,
      enum: ["sick", "casual", "emergency", "authorized"],
    },
    leaveReason: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
