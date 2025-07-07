const express = require("express");
const router = express.Router();
const {
  createExamination,
  getExaminations,
  getExaminationById,
  getExaminationsByClass,
  getExaminationsBySubject,
  updateExamination,
  deleteExamination,
  updateExaminationStatus,
  getExaminationStats,
  getExaminationResults,
} = require("../controllers/examinationController.js");
const { auth } = require("../middleware/auth.js");

// Create examination (admins and teachers)
router.post("/", auth, createExamination);

// Get all examinations with filters
router.get("/", auth, getExaminations);

// Get examination by ID
router.get("/:id", auth, getExaminationById);

// Get examination results
router.get("/:id/results", auth, getExaminationResults);

// Get examinations by class
router.get("/class/:class_id", auth, getExaminationsByClass);

// Get examinations by subject
router.get("/subject/:subject_id", auth, getExaminationsBySubject);

// Get examination statistics
router.get("/stats/overview", auth, getExaminationStats);

// Update examination
router.put("/:id", auth, updateExamination);

// Update examination status
router.put("/:id/status", auth, updateExaminationStatus);

// Delete examination
router.delete("/:id", auth, deleteExamination);

module.exports = router;
