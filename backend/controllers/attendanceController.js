const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
const markAttendance = async (req, res) => {
  try {
    const {
      userId,
      classId,
      date,
      status,
      timeIn,
      timeOut,
      periodWiseAttendance,
      attendanceType,
      remarks,
      leaveType,
      leaveReason,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      userId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      userId,
      classId,
      date: new Date(date),
      status,
      timeIn,
      timeOut,
      periodWiseAttendance,
      attendanceType: attendanceType || "daily",
      remarks,
      leaveType,
      leaveReason,
      markedBy: req.user.id,
    });

    await attendance.populate("userId", "name studentId employeeId");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
};

// @desc    Get attendance by user and date range
// @route   GET /api/attendance/user/:userId
// @access  Private
const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, month, year } = req.query;

    let filter = { userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("userId", "name studentId employeeId")
      .populate("classId", "name grade section")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    // Calculate attendance statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.status === "present").length;
    const absentDays = attendance.filter((a) => a.status === "absent").length;
    const lateDays = attendance.filter((a) => a.status === "late").length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage,
        },
      },
    });
  } catch (error) {
    console.error("Get user attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance",
    });
  }
};

// @desc    Get class attendance for a specific date
// @route   GET /api/attendance/class/:classId/:date
// @access  Private (Teacher/Admin)
const getClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.params;

    const attendance = await Attendance.find({
      classId,
      date: new Date(date),
    })
      .populate("userId", "name studentId employeeId")
      .populate("markedBy", "name")
      .sort({ "userId.name": 1 });

    // Get all students in the class
    const classData = await Class.findById(classId).populate("students", "name studentId");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Create attendance map for quick lookup
    const attendanceMap = new Map();
    attendance.forEach((a) => {
      attendanceMap.set(a.userId._id.toString(), a);
    });

    // Build complete attendance list including unmarked students
    const completeAttendance = classData.students.map((student) => {
      const studentAttendance = attendanceMap.get(student._id.toString());
      return {
        student,
        attendance: studentAttendance || null,
        status: studentAttendance ? studentAttendance.status : "unmarked",
      };
    });

    res.json({
      success: true,
      data: {
        class: classData,
        date,
        attendance: completeAttendance,
      },
    });
  } catch (error) {
    console.error("Get class attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching class attendance",
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher/Admin)
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name studentId employeeId")
      .populate("classId", "name grade section")
      .populate("markedBy", "name");

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attendance",
    });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting attendance",
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Teacher/Admin)
const getAttendanceStats = async (req, res) => {
  try {
    const { classId, month, year } = req.query;

    let filter = {};
    if (classId) filter.classId = classId;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      filter.date = { $gte: start, $lte: end };
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAttendance = stats.reduce((sum, stat) => sum + stat.count, 0);

    const formattedStats = {
      total: totalAttendance,
      present: stats.find((s) => s._id === "present")?.count || 0,
      absent: stats.find((s) => s._id === "absent")?.count || 0,
      late: stats.find((s) => s._id === "late")?.count || 0,
      halfDay: stats.find((s) => s._id === "half_day")?.count || 0,
      leave: stats.find((s) => s._id === "leave")?.count || 0,
    };

    formattedStats.attendancePercentage =
      totalAttendance > 0 ? ((formattedStats.present / totalAttendance) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance statistics",
    });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Teacher/Admin)
const bulkMarkAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceList } = req.body;

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.find({
      classId,
      date: new Date(date),
    });

    if (existingAttendance.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this class on this date",
      });
    }

    // Create attendance records
    const attendanceRecords = attendanceList.map((item) => ({
      userId: item.userId,
      classId,
      date: new Date(date),
      status: item.status,
      timeIn: item.timeIn,
      timeOut: item.timeOut,
      periodWiseAttendance: item.periodWiseAttendance,
      attendanceType: item.attendanceType || "daily",
      remarks: item.remarks,
      leaveType: item.leaveType,
      leaveReason: item.leaveReason,
      markedBy: req.user.id,
    }));

    const createdAttendance = await Attendance.insertMany(attendanceRecords);

    res.status(201).json({
      success: true,
      message: "Bulk attendance marked successfully",
      data: createdAttendance,
    });
  } catch (error) {
    console.error("Bulk mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking bulk attendance",
    });
  }
};

module.exports = {
  markAttendance,
  getUserAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  bulkMarkAttendance,
};
