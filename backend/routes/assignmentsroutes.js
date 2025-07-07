const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../controllers/assignmentController");
const { auth, authorize } = require("../middleware/auth");

// @route   POST /api/assignments
// @desc    Create assignment
// @access  Private (Teacher/Admin)
router.post("/", auth, authorize("teacher", "admin"), createAssignment);

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get("/", auth, getAllAssignments);

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get("/:id", auth, getAssignmentById);

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher/Admin)
router.put("/:id", auth, authorize("teacher", "admin"), updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher/Admin)
router.delete("/:id", auth, authorize("teacher", "admin"), deleteAssignment);

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post("/:id/submit", auth, authorize("student"), submitAssignment);

// @route   GET /api/assignments/:id/submissions
// @desc    Get assignment submissions
// @access  Private (Teacher/Admin)
router.get("/:id/submissions", auth, authorize("teacher", "admin"), getAssignmentSubmissions);

// @route   PUT /api/assignments/submissions/:id/grade
// @desc    Grade assignment submission
// @access  Private (Teacher/Admin)
router.put("/submissions/:id/grade", auth, authorize("teacher", "admin"), gradeSubmission);

module.exports = router; 