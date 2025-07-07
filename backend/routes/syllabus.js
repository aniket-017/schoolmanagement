const express = require("express");
const router = express.Router();
const {
  createSyllabusTracking,
  getSyllabusTracking,
  getSyllabusTrackingById,
  getSyllabusProgress,
  getTeacherSyllabusProgress,
  updateSyllabusTracking,
  updateTopicStatus,
  deleteSyllabusTracking,
  bulkUpdateSyllabusTracking,
  getSyllabusTrackingStats,
} = require("../controllers/syllabusController.js");
const { auth } = require("../middleware/auth.js");

// Create syllabus tracking entry (teachers and admins)
router.post("/", auth, createSyllabusTracking);

// Bulk update syllabus tracking entries
router.post("/bulk-update", auth, bulkUpdateSyllabusTracking);

// Get all syllabus tracking entries with filters
router.get("/", auth, getSyllabusTracking);

// Get syllabus tracking by ID
router.get("/:id", auth, getSyllabusTrackingById);

// Get syllabus progress by class and subject
router.get("/progress/:class_id/:subject_id", auth, getSyllabusProgress);

// Get teacher's syllabus progress
router.get("/teacher/:teacher_id/progress", auth, getTeacherSyllabusProgress);

// Get syllabus tracking statistics
router.get("/stats/overview", auth, getSyllabusTrackingStats);

// Update syllabus tracking entry
router.put("/:id", auth, updateSyllabusTracking);

// Update topic status
router.put("/:id/status", auth, updateTopicStatus);

// Delete syllabus tracking entry
router.delete("/:id", auth, deleteSyllabusTracking);

module.exports = router;
