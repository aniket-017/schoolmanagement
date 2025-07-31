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
  getClassFeeStatus,
  createClassFees,
  updateFeeStatus,
  createFeesFromSlab,
  generateFeesForStudent,
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

// @route   GET /api/fees/class/:classId/status
// @desc    Get class fee status
// @access  Private (Admin only)
router.get("/class/:classId/status", auth, authorize("admin"), getClassFeeStatus);

// @route   GET /api/fees/student/:studentId
// @desc    Get student fees
// @access  Private
router.get("/student/:studentId", auth, getStudentFees);

// @route   POST /api/fees/student/:studentId/from-slab
// @desc    Create fees from fee slab for a student
// @access  Private (Admin only)
router.post("/student/:studentId/from-slab", auth, authorize("admin"), createFeesFromSlab);

// @route   POST /api/fees/student/:studentId/generate
// @desc    Generate fee records for student with fee slab but no fees
// @access  Private (Admin only)
router.post("/student/:studentId/generate", auth, authorize("admin"), generateFeesForStudent);

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

// @route   POST /api/fees/class/:classId
// @desc    Create fees for all students in a class
// @access  Private (Admin only)
router.post("/class/:classId", auth, authorize("admin"), createClassFees);

// @route   PUT /api/fees/:feeId/status
// @desc    Update fee status (mark as paid/remaining)
// @access  Private (Admin only)
router.put("/:feeId/status", auth, authorize("admin"), updateFeeStatus);

module.exports = router;
