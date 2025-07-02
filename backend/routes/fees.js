const express = require("express");
const router = express.Router();
const { auth, authenticated, adminOnly } = require("../middleware/auth");

// @route   GET /api/fees
// @desc    Get fee records
// @access  Private (All authenticated users)
router.get("/", auth, authenticated, (req, res) => {
  res.json({
    success: true,
    message: "Get fees endpoint - To be implemented",
  });
});

// @route   POST /api/fees
// @desc    Create fee record
// @access  Private (Admin only)
router.post("/", auth, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Create fee record endpoint - To be implemented",
  });
});

module.exports = router;
