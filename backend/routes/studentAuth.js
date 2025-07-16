const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middleware/auth");
const {
  studentLogin,
  getStudentProfile,
  updateStudentProfile,
  generateStudentPassword,
  changeStudentPassword,
} = require("../controllers/studentAuthController");

// @route   POST /api/student-auth/login
// @desc    Student login
// @access  Public
router.post("/login", studentLogin);

// @route   GET /api/student-auth/profile
// @desc    Get student profile
// @access  Private (Student)
router.get("/profile", auth, getStudentProfile);

// @route   PUT /api/student-auth/profile
// @desc    Update student profile
// @access  Private (Student)
router.put("/profile", auth, updateStudentProfile);

// @route   PUT /api/student-auth/change-password
// @desc    Change student password
// @access  Private (Student)
router.put("/change-password", auth, changeStudentPassword);

// @route   POST /api/student-auth/generate-password/:studentId
// @desc    Generate student login password (Admin only)
// @access  Private (Admin)
router.post("/generate-password/:studentId", auth, adminOnly, generateStudentPassword);

module.exports = router; 