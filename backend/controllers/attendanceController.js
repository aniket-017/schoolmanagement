const StudentAttendance = require("../models/Attendance");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Student = require("../models/Student");

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
const markAttendance = async (req, res) => {
  try {
    const {
      studentId,
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

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find or create student attendance document
    let studentAttendance = await StudentAttendance.findOne({ studentId, classId });

    if (!studentAttendance) {
      studentAttendance = new StudentAttendance({
        studentId,
        classId,
        academicYear: new Date().getFullYear().toString(),
        attendanceRecords: [],
      });
    }

    // Add attendance record
    await studentAttendance.addAttendanceRecord({
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

    await studentAttendance.populate("studentId", "name studentId rollNumber");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: studentAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
};

// @desc    Get attendance by student and date range
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, month, year, limit = 30 } = req.query;

    // Get student information
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentAttendance = await StudentAttendance.findOne({ studentId })
      .populate("studentId", "name studentId rollNumber")
      .populate("classId", "name grade section")
      .populate("attendanceRecords.markedBy", "name");

    // If no attendance record exists, return empty data instead of 404
    if (!studentAttendance) {
      return res.json({
        success: true,
        data: {
          student: {
            _id: student._id,
            name: student.name,
            studentId: student.studentId,
            rollNumber: student.rollNumber
          },
          class: student.class || null,
          attendance: [],
          statistics: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            attendancePercentage: 0,
          },
        },
      });
    }

    let filteredRecords = studentAttendance.attendanceRecords;

    if (startDate && endDate) {
      filteredRecords = studentAttendance.getAttendanceForRange(startDate, endDate);
    } else if (month && year) {
      filteredRecords = studentAttendance.getAttendanceForMonth(parseInt(month), parseInt(year));
    }

    // Limit records if specified
    if (limit) {
      filteredRecords = filteredRecords.slice(0, parseInt(limit));
    }

    // Calculate attendance statistics
    const totalDays = filteredRecords.length;
    const presentDays = filteredRecords.filter((a) => a.status === "present").length;
    const absentDays = filteredRecords.filter((a) => a.status === "absent").length;
    const lateDays = filteredRecords.filter((a) => a.status === "late").length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        student: studentAttendance.studentId,
        class: studentAttendance.classId,
        attendance: filteredRecords,
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
    console.error("Get student attendance error:", error);
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

    // Get all students in the class
    const classData = await Class.findById(classId).populate(
      "students",
      "firstName lastName middleName name studentId rollNumber"
    );

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get attendance for the class on the specific date
    const classAttendance = await StudentAttendance.getClassAttendanceForDate(classId, date);

    // Create attendance map for quick lookup
    const attendanceMap = new Map();
    classAttendance.forEach((item) => {
      if (item.student) {
        attendanceMap.set(item.student._id.toString(), item);
      }
    });

    // Build complete attendance list including unmarked students
    const completeAttendance = classData.students.map((student) => {
      const studentAttendance = attendanceMap.get(student._id.toString());
      return {
        student: {
          ...student.toObject(),
          name:
            student.name || `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim(),
        },
        attendance: studentAttendance ? studentAttendance.attendance : null,
        status: studentAttendance ? studentAttendance.status : "unmarked",
      };
    });

    // Calculate summary
    const summary = {
      total: completeAttendance.length,
      present: completeAttendance.filter((a) => a.status === "present").length,
      absent: completeAttendance.filter((a) => a.status === "absent").length,
      late: completeAttendance.filter((a) => a.status === "late").length,
      leave: completeAttendance.filter((a) => a.status === "leave").length,
      unmarked: completeAttendance.filter((a) => a.status === "unmarked").length,
    };

    res.json({
      success: true,
      data: {
        class: classData,
        date,
        attendance: completeAttendance,
        summary,
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

// @desc    Update attendance record
// @route   PUT /api/attendance/:studentId/:date
// @access  Private (Teacher/Admin)
const updateAttendance = async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const updateData = req.body;

    const studentAttendance = await StudentAttendance.findOne({ studentId });

    if (!studentAttendance) {
      return res.status(404).json({
        success: false,
        message: "Student attendance record not found",
      });
    }

    // Find the attendance record for the specific date
    const recordIndex = studentAttendance.attendanceRecords.findIndex(
      (record) => record.date.toDateString() === new Date(date).toDateString()
    );

    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found for this date",
      });
    }

    // Update the record
    studentAttendance.attendanceRecords[recordIndex] = {
      ...studentAttendance.attendanceRecords[recordIndex],
      ...updateData,
      markedBy: req.user.id,
      markedAt: new Date(),
    };

    await studentAttendance.save();
    await studentAttendance.populate("studentId", "name studentId rollNumber");

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: studentAttendance.attendanceRecords[recordIndex],
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attendance",
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:studentId/:date
// @access  Private (Admin only)
const deleteAttendance = async (req, res) => {
  try {
    const { studentId, date } = req.params;

    const studentAttendance = await StudentAttendance.findOne({ studentId });

    if (!studentAttendance) {
      return res.status(404).json({
        success: false,
        message: "Student attendance record not found",
      });
    }

    // Remove the attendance record for the specific date
    const recordIndex = studentAttendance.attendanceRecords.findIndex(
      (record) => record.date.toDateString() === new Date(date).toDateString()
    );

    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found for this date",
      });
    }

    studentAttendance.attendanceRecords.splice(recordIndex, 1);
    await studentAttendance.save();

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
// @access  Private (Admin/Teacher)
const getAttendanceStats = async (req, res) => {
  try {
    const { classId, startDate, endDate, timeRange = "month" } = req.query;

    let filter = {};
    if (classId) filter.classId = classId;

    const studentAttendances = await StudentAttendance.find(filter)
      .populate("studentId", "name studentId rollNumber")
      .populate("classId", "name grade section");

    let filteredAttendances = studentAttendances;

    // Filter by date range if provided
    if (startDate && endDate) {
      filteredAttendances = studentAttendances.map((sa) => ({
        ...sa.toObject(),
        attendanceRecords: sa.getAttendanceForRange(startDate, endDate),
      }));
    }

    // Calculate overall statistics
    let totalRecords = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;

    filteredAttendances.forEach((sa) => {
      sa.attendanceRecords.forEach((record) => {
        totalRecords++;
        switch (record.status) {
          case "present":
            totalPresent++;
            break;
          case "absent":
            totalAbsent++;
            break;
          case "late":
            totalLate++;
            break;
          case "leave":
            totalLeave++;
            break;
        }
      });
    });

    const overallPercentage = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(2) : 0;

    // Calculate class-wise statistics
    const classStats = {};
    filteredAttendances.forEach((sa) => {
      const className = sa.classId ? `${sa.classId.grade}${sa.classId.division}` : "Unknown";
      if (!classStats[className]) {
        classStats[className] = {
          totalStudents: 0,
          totalRecords: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          totalLeave: 0,
        };
      }

      classStats[className].totalStudents++;
      sa.attendanceRecords.forEach((record) => {
        classStats[className].totalRecords++;
        switch (record.status) {
          case "present":
            classStats[className].totalPresent++;
            break;
          case "absent":
            classStats[className].totalAbsent++;
            break;
          case "late":
            classStats[className].totalLate++;
            break;
          case "leave":
            classStats[className].totalLeave++;
            break;
        }
      });
    });

    // Calculate percentages for each class
    Object.keys(classStats).forEach((className) => {
      const stats = classStats[className];
      stats.attendancePercentage =
        stats.totalRecords > 0 ? ((stats.totalPresent / stats.totalRecords) * 100).toFixed(2) : 0;
    });

    res.json({
      success: true,
      data: {
        overall: {
          totalRecords,
          totalPresent,
          totalAbsent,
          totalLate,
          totalLeave,
          attendancePercentage: overallPercentage,
        },
        classStats,
        totalStudents: filteredAttendances.length,
      },
    });
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance statistics",
    });
  }
};

// @desc    Bulk mark attendance for a class
// @route   POST /api/attendance/bulk
// @access  Private (Teacher/Admin)
const bulkMarkAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body;

    if (!classId || !date || !attendanceData) {
      return res.status(400).json({
        success: false,
        message: "Class ID, date, and attendance data are required",
      });
    }

    // Use the static method to bulk mark attendance
    await StudentAttendance.bulkMarkClassAttendance(classId, date, attendanceData);

    res.json({
      success: true,
      message: "Attendance marked successfully for all students",
    });
  } catch (error) {
    console.error("Bulk mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
};

// @desc    Get teacher's assigned classes
// @route   GET /api/attendance/teacher/classes
// @access  Private (Teacher)
const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get classes where the teacher is assigned as class teacher
    const classes = await Class.find({ classTeacher: teacherId })
      .populate("students", "firstName lastName middleName name studentId rollNumber")
      .select("name grade division students");

    const classesWithStats = await Promise.all(
      classes.map(async (classItem) => {
        // Get today's attendance for this class
        const today = new Date().toISOString().split("T")[0];
        const classAttendance = await StudentAttendance.getClassAttendanceForDate(classItem._id, today);

        const totalStudents = classItem.students.length;
        const markedStudents = classAttendance.filter((item) => item.status !== "unmarked").length;

        return {
          _id: classItem._id,
          name: classItem.name,
          grade: classItem.grade,
          division: classItem.division,
          fullName: `${classItem.grade}${getOrdinalSuffix(classItem.grade)} Class - ${classItem.division}`,
          totalStudents,
          markedStudents,
          attendanceMarked: markedStudents > 0,
          attendancePercentage: totalStudents > 0 ? ((markedStudents / totalStudents) * 100).toFixed(1) : 0,
        };
      })
    );

    res.json({
      success: true,
      data: classesWithStats,
    });
  } catch (error) {
    console.error("Get teacher classes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher classes",
    });
  }
};

// @desc    Get students in a class
// @route   GET /api/attendance/class/:classId/students
// @access  Private (Teacher/Admin)
const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId)
      .populate({
        path: "students",
        populate: {
          path: "feeSlabId",
          select: "slabName totalAmount installments"
        }
        // Do not limit select, return all fields
      })
      .select("name grade division students");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Ensure students have the name field
    const studentsWithName = classData.students.map((student) => ({
      ...student.toObject(),
      name: student.name || `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim(),
    }));

    const response = {
      success: true,
      data: {
        class: {
          _id: classData._id,
          name: classData.name,
          grade: classData.grade,
          division: classData.division,
          fullName: `${classData.grade}${getOrdinalSuffix(classData.grade)} Class - ${classData.division}`,
        },
        students: studentsWithName,
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching class students",
    });
  }
};

// @desc    Get class attendance by date (for mobile app compatibility)
// @route   GET /api/attendance/class-attendance/:classId/:date
// @access  Private (Teacher/Admin)
const getClassAttendanceByDate = async (req, res) => {
  try {
    const { classId, date } = req.params;

    // Get all students in the class
    const classData = await Class.findById(classId).populate(
      "students",
      "firstName lastName middleName name studentId rollNumber"
    );

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get attendance for the class on the specific date
    const classAttendance = await StudentAttendance.getClassAttendanceForDate(classId, date);

    // Create attendance map for quick lookup
    const attendanceMap = new Map();
    classAttendance.forEach((item) => {
      if (item.student) {
        attendanceMap.set(item.student._id.toString(), item);
      }
    });

    // Build complete attendance list including unmarked students
    const completeAttendance = classData.students.map((student) => {
      const studentAttendance = attendanceMap.get(student._id.toString());
      return {
        student: {
          ...student.toObject(),
          name:
            student.name || `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim(),
        },
        attendance: studentAttendance ? studentAttendance.attendance : null,
        status: studentAttendance ? studentAttendance.status : "unmarked",
      };
    });

    // Calculate summary
    const summary = {
      total: completeAttendance.length,
      present: completeAttendance.filter((a) => a.status === "present").length,
      absent: completeAttendance.filter((a) => a.status === "absent").length,
      late: completeAttendance.filter((a) => a.status === "late").length,
      leave: completeAttendance.filter((a) => a.status === "leave").length,
      unmarked: completeAttendance.filter((a) => a.status === "unmarked").length,
    };

    res.json({
      success: true,
      data: {
        class: classData,
        date,
        attendance: completeAttendance,
        summary,
      },
    });
  } catch (error) {
    console.error("Get class attendance by date error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching class attendance",
    });
  }
};

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
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

module.exports = {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  bulkMarkAttendance,
  getTeacherClasses,
  getClassStudents,
  getClassAttendanceByDate,
};
