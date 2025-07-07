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

module.exports = router;
