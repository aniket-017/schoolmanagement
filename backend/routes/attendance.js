const express = require("express");
const router = express.Router();
const { auth, authenticated } = require("../middleware/auth");
const {
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
} = require("../controllers/attendanceController");

// @route   POST /api/attendance
// @desc    Mark attendance for a student
// @access  Private (Teacher/Admin)
router.post("/", auth, markAttendance);

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance by student and date range
// @access  Private
router.get("/student/:studentId", auth, authenticated, getStudentAttendance);

// @route   GET /api/attendance/class/:classId/students
// @desc    Get students in a class
// @access  Private (Teacher/Admin)
router.get("/class/:classId/students", auth, getClassStudents);

// @route   GET /api/attendance/class/:classId/:date
// @desc    Get class attendance for a specific date
// @access  Private (Teacher/Admin)
router.get("/class/:classId/:date", auth, getClassAttendance);

// @route   PUT /api/attendance/:studentId/:date
// @desc    Update attendance record
// @access  Private (Teacher/Admin)
router.put("/:studentId/:date", auth, updateAttendance);

// @route   DELETE /api/attendance/:studentId/:date
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete("/:studentId/:date", auth, deleteAttendance);

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private (Admin/Teacher)
router.get("/stats", auth, getAttendanceStats);

// @route   POST /api/attendance/bulk
// @desc    Bulk mark attendance for a class
// @access  Private (Teacher/Admin)
router.post("/bulk", auth, bulkMarkAttendance);

// @route   GET /api/attendance/teacher/classes
// @desc    Get teacher's assigned classes
// @access  Private (Teacher)
router.get("/teacher/classes", auth, getTeacherClasses);

// @route   GET /api/attendance/class-attendance/:classId/:date
// @desc    Get class attendance by date (for mobile app compatibility)
// @access  Private (Teacher/Admin)
router.get("/class-attendance/:classId/:date", auth, getClassAttendanceByDate);

module.exports = router;
