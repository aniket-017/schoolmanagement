const express = require("express");
const router = express.Router();
const {
  createGrade,
  getGrades,
  getGradeById,
  getStudentGrades,
  getClassGrades,
  updateGrade,
  deleteGrade,
  bulkCreateGrades,
  getGradeStats,
} = require("../controllers/gradeController");
const { auth } = require("../middleware/auth");

// Create grade (teachers and admins)
router.post("/", auth, createGrade);

// Bulk create grades (teachers and admins)
router.post("/bulk", auth, bulkCreateGrades);

// Get all grades with filters
router.get("/", auth, getGrades);

// Get grade by ID
router.get("/:id", auth, getGradeById);

// Get student grades
router.get("/student/:student_id", auth, getStudentGrades);

// Get class grades for an examination
router.get("/examination/:examination_id", auth, getClassGrades);

// Get grade statistics
router.get("/stats/overview", auth, getGradeStats);

// Update grade
router.put("/:id", auth, updateGrade);

// Delete grade
router.delete("/:id", auth, deleteGrade);

module.exports = router;
