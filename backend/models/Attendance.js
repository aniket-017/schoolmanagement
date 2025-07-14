const mongoose = require("mongoose");

// Individual attendance record schema
const attendanceRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date required"],
    },
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

// Create indexes for the embedded attendance records
attendanceRecordSchema.index({ date: 1 });
attendanceRecordSchema.index({ status: 1 });

// Student attendance schema - stores attendance records as an array
const studentAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      unique: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    attendanceRecords: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Create indexes
studentAttendanceSchema.index({ studentId: 1 });
studentAttendanceSchema.index({ classId: 1 });
studentAttendanceSchema.index({ academicYear: 1 });
studentAttendanceSchema.index({ "attendanceRecords.date": 1 });

// Virtual for getting attendance statistics
studentAttendanceSchema.virtual("statistics").get(function () {
  const totalDays = this.attendanceRecords.length;
  const presentDays = this.attendanceRecords.filter((record) => record.status === "present").length;
  const absentDays = this.attendanceRecords.filter((record) => record.status === "absent").length;
  const lateDays = this.attendanceRecords.filter((record) => record.status === "late").length;
  const leaveDays = this.attendanceRecords.filter((record) => record.status === "leave").length;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leaveDays,
    attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0,
  };
});

// Method to add attendance record
studentAttendanceSchema.methods.addAttendanceRecord = function (record) {
  // Check if attendance already exists for this date
  const existingIndex = this.attendanceRecords.findIndex(
    (r) => r.date.toDateString() === new Date(record.date).toDateString()
  );

  if (existingIndex !== -1) {
    // Update existing record
    this.attendanceRecords[existingIndex] = { ...this.attendanceRecords[existingIndex], ...record };
  } else {
    // Add new record
    this.attendanceRecords.push(record);
  }

  // Sort records by date (newest first)
  this.attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  return this.save();
};

// Method to get attendance for date range
studentAttendanceSchema.methods.getAttendanceForRange = function (startDate, endDate) {
  return this.attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });
};

// Method to get attendance for specific month
studentAttendanceSchema.methods.getAttendanceForMonth = function (month, year) {
  return this.attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === month - 1 && recordDate.getFullYear() === year;
  });
};

// Static method to get class attendance for a specific date
studentAttendanceSchema.statics.getClassAttendanceForDate = async function (classId, date) {
  const dateString = new Date(date).toDateString();

  const classAttendance = await this.find({ classId })
    .populate("studentId", "name studentId rollNumber")
    .populate("attendanceRecords.markedBy", "name")
    .lean();

  return classAttendance.map((studentAttendance) => {
    const recordForDate = studentAttendance.attendanceRecords.find(
      (record) => new Date(record.date).toDateString() === dateString
    );

    return {
      student: studentAttendance.studentId,
      attendance: recordForDate || null,
      status: recordForDate ? recordForDate.status : "unmarked",
    };
  });
};

// Static method to bulk mark attendance for a class
studentAttendanceSchema.statics.bulkMarkClassAttendance = async function (classId, date, attendanceData) {
  const dateObj = new Date(date);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const [studentId, attendanceRecord] of Object.entries(attendanceData)) {
        if (attendanceRecord.status && attendanceRecord.status !== "unmarked") {
          // Find or create student attendance document
          let studentAttendance = await this.findOne({ studentId, classId });

          if (!studentAttendance) {
            // Create new student attendance document
            studentAttendance = new this({
              studentId,
              classId,
              academicYear: new Date().getFullYear().toString(),
              attendanceRecords: [],
            });
          }

          // Add or update attendance record
          await studentAttendance.addAttendanceRecord({
            ...attendanceRecord,
            date: dateObj,
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = mongoose.model("StudentAttendance", studentAttendanceSchema);
