const express = require("express");
const router = express.Router();
const {
  createFee,
  getAllFees,
  getStudentFees,
  processFeePayment,
  updateFee,
  deleteFee,
  getFeeStats,
} = require("../controllers/feeController");
const { auth, authorize } = require("../middleware/auth");

// @route   POST /api/fees
// @desc    Create fee record
// @access  Private (Admin only)
router.post("/", auth, authorize("admin"), createFee);

// @route   GET /api/fees
// @desc    Get all fees
// @access  Private (Admin only)
router.get("/", auth, authorize("admin"), getAllFees);

// @route   GET /api/fees/stats
// @desc    Get fee statistics
// @access  Private (Admin only)
router.get("/stats", auth, authorize("admin"), getFeeStats);

// @route   GET /api/fees/student/:studentId
// @desc    Get student fees
// @access  Private
router.get("/student/:studentId", auth, getStudentFees);

// @route   PUT /api/fees/:id/pay
// @desc    Process fee payment
// @access  Private
router.put("/:id/pay", auth, processFeePayment);

// @route   PUT /api/fees/:id
// @desc    Update fee record
// @access  Private (Admin only)
router.put("/:id", auth, authorize("admin"), updateFee);

// @route   DELETE /api/fees/:id
// @desc    Delete fee record
// @access  Private (Admin only)
router.delete("/:id", auth, authorize("admin"), deleteFee);

module.exports = router;
