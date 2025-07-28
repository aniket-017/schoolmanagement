const express = require("express");
const router = express.Router();
const {
  getAllFeeOutlines,
  getFeeOutlineById,
  createFeeOutline,
  updateFeeOutline,
  deleteFeeOutline,
  getFeeOutlinesByClass,
  getDefaultFeeOutline,
  duplicateFeeOutline,
} = require("../controllers/feeOutlineController");
const { auth, adminOrPrincipal } = require("../middleware/auth");

// @route   GET /api/fee-outlines
// @desc    Get all fee outlines
// @access  Private (Admin only)
router.get("/", auth, adminOrPrincipal, getAllFeeOutlines);

// @route   GET /api/fee-outlines/class/:classId
// @desc    Get fee outlines by class
// @access  Private
router.get("/class/:classId", auth, getFeeOutlinesByClass);

// @route   GET /api/fee-outlines/class/:classId/default
// @desc    Get default fee outline for a class
// @access  Private
router.get("/class/:classId/default", auth, getDefaultFeeOutline);

// @route   GET /api/fee-outlines/:id
// @desc    Get fee outline by ID
// @access  Private (Admin only)
router.get("/:id", auth, adminOrPrincipal, getFeeOutlineById);

// @route   POST /api/fee-outlines
// @desc    Create fee outline
// @access  Private (Admin only)
router.post("/", auth, adminOrPrincipal, createFeeOutline);

// @route   POST /api/fee-outlines/:id/duplicate
// @desc    Duplicate fee outline
// @access  Private (Admin only)
router.post("/:id/duplicate", auth, adminOrPrincipal, duplicateFeeOutline);

// @route   PUT /api/fee-outlines/:id
// @desc    Update fee outline
// @access  Private (Admin only)
router.put("/:id", auth, adminOrPrincipal, updateFeeOutline);

// @route   DELETE /api/fee-outlines/:id
// @desc    Delete fee outline
// @access  Private (Admin only)
router.delete("/:id", auth, adminOrPrincipal, deleteFeeOutline);

module.exports = router;
