const express = require("express");
const router = express.Router();
const { auth, teacherOrAdmin } = require("../middleware/auth");

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private (Teacher/Admin)
router.get("/", auth, teacherOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Get all classes endpoint - To be implemented",
  });
});

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin only)
router.post("/", auth, (req, res) => {
  res.json({
    success: true,
    message: "Create class endpoint - To be implemented",
  });
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private (Teacher/Admin)
router.get("/:id", auth, teacherOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: `Get class ${req.params.id} endpoint - To be implemented`,
  });
});

module.exports = router;
