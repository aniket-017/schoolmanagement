const express = require("express");
const router = express.Router();
const {
  createTimetable,
  getTimetables,
  getTimetableById,
  getClassTimetable,
  getTeacherTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableStats,
} = require("../controllers/timetableController.js");
const { auth } = require("../middleware/auth.js");

// Create timetable entry (admins only)
router.post("/", auth, createTimetable);

// Get all timetable entries with filters
router.get("/", auth, getTimetables);

// Get timetable by ID
router.get("/:id", auth, getTimetableById);

// Get class timetable (organized by day)
router.get("/class/:class_id", auth, getClassTimetable);

// Get teacher timetable
router.get("/teacher/:teacher_id", auth, getTeacherTimetable);

// Get timetable statistics
router.get("/stats/overview", auth, getTimetableStats);

// Update timetable entry
router.put("/:id", auth, updateTimetable);

// Delete timetable entry
router.delete("/:id", auth, deleteTimetable);

module.exports = router;
