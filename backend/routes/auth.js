const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  rejectUser,
} = require("../controllers/authController");
const { auth, adminOnly } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (requires admin approval)
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", auth, changePassword);

// Admin routes for user approval
router.get("/pending-users", auth, adminOnly, getPendingUsers);
router.put("/approve-user/:id", auth, adminOnly, approveUser);
router.put("/reject-user/:id", auth, adminOnly, rejectUser);

module.exports = router;
