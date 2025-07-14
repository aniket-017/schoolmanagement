const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getUserAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getAttendanceStats,
  getTeacherClasses,
  getClassStudents,
  getClassAttendanceByDate,
  bulkMarkClassAttendance,
} = require("../controllers/attendanceController");
const { auth } = require("../middleware/auth");

// Mark attendance (teachers and admins)
router.post("/mark", auth, markAttendance);

// Bulk mark attendance (teachers and admins)
router.post("/bulk-mark", auth, bulkMarkAttendance);

// Get user attendance history
router.get("/user/:userId", auth, getUserAttendance);

// Get class attendance for a specific date
router.get("/class/:classId/:date", auth, getClassAttendance);

// Get attendance statistics
router.get("/stats", auth, getAttendanceStats);

// Update attendance record
router.put("/:id", auth, updateAttendance);

// Delete attendance record
router.delete("/:id", auth, deleteAttendance);

// Mobile app specific routes
// Get classes for a teacher
router.get("/teacher-classes", auth, getTeacherClasses);

// Get students by class
router.get("/class-students/:classId", auth, getClassStudents);

// Get attendance for a class on a specific date
router.get("/class-attendance/:classId/:date", auth, getClassAttendanceByDate);

// Bulk mark attendance for a class
router.post("/bulk-mark-class", auth, bulkMarkClassAttendance);

module.exports = router;
