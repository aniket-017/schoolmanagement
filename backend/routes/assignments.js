const express = require("express");
const router = express.Router();
const { auth, authenticated } = require("../middleware/auth");

// @route   GET /api/assignments
// @desc    Get assignments
// @access  Private (All authenticated users)
router.get("/", auth, authenticated, (req, res) => {
  res.json({
    success: true,
    message: "Get assignments endpoint - To be implemented",
  });
});

// @route   POST /api/assignments
// @desc    Create assignment
// @access  Private (Teacher/Admin)
router.post("/", auth, (req, res) => {
  res.json({
    success: true,
    message: "Create assignment endpoint - To be implemented",
  });
});

module.exports = router;
