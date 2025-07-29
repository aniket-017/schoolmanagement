const express = require("express");
const router = express.Router();
const {
  createHomework,
  getAllHomework,
  getHomeworkById,
  updateHomework,
  deleteHomework,
  updateStudentProgress,
  getHomeworkCalendar,
  getHomeworkStats,
} = require("../controllers/homeworkController");
const { auth } = require("../middleware/auth");
const Homework = require("../models/Homework");

// Test route to check if homework model works (no auth required)
router.get("/test", async (req, res) => {
  try {
    console.log("Testing homework model...");
    const count = await Homework.countDocuments();
    console.log("Homework count:", count);
    res.json({
      success: true,
      message: "Homework model is working",
      count: count
    });
  } catch (error) {
    console.error("Homework test error:", error);
    res.status(500).json({
      success: false,
      message: "Homework model error",
      error: error.message
    });
  }
});

// All routes are protected
router.use(auth);

// @route   POST /api/homework
// @desc    Create new homework
// @access  Private (Teacher/Admin)
router.post("/", createHomework);

// @route   GET /api/homework
// @desc    Get all homework
// @access  Private
router.get("/", getAllHomework);

// @route   GET /api/homework/stats
// @desc    Get homework statistics
// @access  Private
router.get("/stats", getHomeworkStats);

// @route   GET /api/homework/calendar
// @desc    Get homework calendar data
// @access  Private
router.get("/calendar", getHomeworkCalendar);

// @route   GET /api/homework/:id
// @desc    Get homework by ID
// @access  Private
router.get("/:id", getHomeworkById);

// @route   PUT /api/homework/:id
// @desc    Update homework
// @access  Private (Teacher/Admin)
router.put("/:id", updateHomework);

// @route   DELETE /api/homework/:id
// @desc    Delete homework
// @access  Private (Teacher/Admin)
router.delete("/:id", deleteHomework);

// @route   PUT /api/homework/:id/progress
// @desc    Update student progress
// @access  Private (Student)
router.put("/:id/progress", updateStudentProgress);

module.exports = router; 