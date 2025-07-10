const express = require("express");
const router = express.Router();
const { auth, teacherOrAdmin } = require("../middleware/auth");
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignClassTeacher,
  getAvailableTeachers,
} = require("../controllers/classController");

// Test route to verify API is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Classes API is working",
    timestamp: new Date().toISOString(),
  });
});

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private (Teacher/Admin)
router.get("/", auth, teacherOrAdmin, getAllClasses);

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin only)
router.post("/", auth, createClass);

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private (Teacher/Admin)
router.get("/:id", auth, teacherOrAdmin, getClassById);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin only)
router.put("/:id", auth, updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
router.delete("/:id", auth, deleteClass);

// @route   PUT /api/classes/:id/assign-teacher
// @desc    Assign class teacher
// @access  Private (Admin only)
router.put("/:id/assign-teacher", auth, assignClassTeacher);

// @route   GET /api/classes/available-teachers
// @desc    Get available teachers for assignment
// @access  Private (Admin only)
router.get("/available-teachers", auth, getAvailableTeachers);

module.exports = router;
