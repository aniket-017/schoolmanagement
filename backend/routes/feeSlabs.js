const express = require("express");
const router = express.Router();
const { auth, adminOrPrincipal } = require("../middleware/auth");
const {
  getAllFeeSlabs,
  getFeeSlabById,
  createFeeSlab,
  updateFeeSlab,
  deleteFeeSlab,
  calculateWithConcession,
} = require("../controllers/feeSlabController");

// @route   GET /api/fee-slabs
// @desc    Get all fee slabs
// @access  Private (Admin/Principal)
router.get("/", auth, adminOrPrincipal, getAllFeeSlabs);

// @route   GET /api/fee-slabs/:id
// @desc    Get fee slab by ID
// @access  Private (Admin/Principal)
router.get("/:id", auth, adminOrPrincipal, getFeeSlabById);

// @route   POST /api/fee-slabs
// @desc    Create fee slab
// @access  Private (Admin/Principal)
router.post("/", auth, adminOrPrincipal, createFeeSlab);

// @route   PUT /api/fee-slabs/:id
// @desc    Update fee slab
// @access  Private (Admin/Principal)
router.put("/:id", auth, adminOrPrincipal, updateFeeSlab);

// @route   DELETE /api/fee-slabs/:id
// @desc    Delete fee slab
// @access  Private (Admin/Principal)
router.delete("/:id", auth, adminOrPrincipal, deleteFeeSlab);

// @route   POST /api/fee-slabs/:id/calculate-concession
// @desc    Calculate installments with concession
// @access  Private
router.post("/:id/calculate-concession", auth, calculateWithConcession);

module.exports = router;
