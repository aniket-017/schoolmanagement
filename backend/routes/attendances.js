const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getAttendanceStats,
  getTeacherClasses,
  getClassStudents,
  getClassAttendanceByDate,
} = require("../controllers/attendanceController");
const { auth } = require("../middleware/auth");

// Mark attendance (teachers and admins)
router.post("/mark", auth, markAttendance);

// Bulk mark attendance (teachers and admins)
router.post("/bulk-mark", auth, bulkMarkAttendance);

// Get student attendance history
router.get("/student/:studentId", auth, getStudentAttendance);

// Get class attendance for a specific date
router.get("/class/:classId/:date", auth, getClassAttendance);

// Get attendance statistics
router.get("/stats", auth, getAttendanceStats);

// Update attendance record
router.put("/:studentId/:date", auth, updateAttendance);

// Delete attendance record
router.delete("/:studentId/:date", auth, deleteAttendance);

// Mobile app specific routes
// Get classes for a teacher
router.get("/teacher-classes", auth, getTeacherClasses);

// Get students by class
router.get("/class-students/:classId", auth, getClassStudents);

// Get attendance for a class on a specific date
router.get("/class-attendance/:classId/:date", auth, getClassAttendanceByDate);

module.exports = router;
