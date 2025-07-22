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
  createOrUpdateClassTimetable,
  getTeacherAvailability,
  createTimetableOutline,
  getTimetableOutlines,
  getTimetableOutlineById,
  updateTimetableOutline,
  deleteTimetableOutline,
  deleteClassTimetable,
} = require("../controllers/timetableController.js");
const { auth } = require("../middleware/auth.js");

// Create timetable entry (admins only)
router.post("/", auth, createTimetable);

// Get all timetable entries with filters
router.get("/", auth, getTimetables);

// Timetable Outline CRUD
router.post("/outlines", auth, createTimetableOutline);
router.get("/outlines", auth, getTimetableOutlines);
router.get("/outlines/:id", auth, getTimetableOutlineById);
router.put("/outlines/:id", auth, updateTimetableOutline);
router.delete("/outlines/:id", auth, deleteTimetableOutline);

// Delete all timetable entries for a class and academic year
router.delete("/class/:classId", auth, deleteClassTimetable);

// Get timetable by ID
router.get("/:id", auth, getTimetableById);

// Get class timetable (organized by day)
router.get("/class/:classId", auth, getClassTimetable);

// Create or update class timetable (bulk operation)
router.post("/class/:classId", auth, createOrUpdateClassTimetable);

// Get teacher availability for a specific time slot
router.get("/teacher/availability", auth, getTeacherAvailability);

// Get teacher timetable
router.get("/teacher/:teacherId", auth, getTeacherTimetable);

// Get timetable statistics
router.get("/stats/overview", auth, getTimetableStats);

// Update timetable entry
router.put("/:id", auth, updateTimetable);

// Delete timetable entry
router.delete("/:id", auth, deleteTimetable);

module.exports = router;
