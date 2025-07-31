const express = require("express");
const router = express.Router();
const {
  sendFeeReminder,
  getUserMessages,
  markMessageAsRead,
  getUnreadMessageCount,
  deleteMessage,
} = require("../controllers/messageController");
const { auth } = require("../middleware/auth");

// @route   POST /api/messages/fee-reminder
// @desc    Send fee reminder message to student
// @access  Private (Admin only)
router.post("/fee-reminder", auth, sendFeeReminder);

// @route   GET /api/messages
// @desc    Get user messages
// @access  Private
router.get("/", auth, getUserMessages);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get("/unread-count", auth, getUnreadMessageCount);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put("/:id/read", auth, markMessageAsRead);

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete("/:id", auth, deleteMessage);

module.exports = router; 

