const express = require("express");
const router = express.Router();
const {
  sendMessage,
  sendBulkMessage,
  getUserMessages,
  getMessageById,
  getConversationThread,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
  searchMessages,
} = require("../controllers/communicationController");
const { auth } = require("../middleware/auth");

// @route   POST /api/communications
// @desc    Send message
// @access  Private
router.post("/", auth, sendMessage);

// @route   POST /api/communications/bulk
// @desc    Send bulk message to multiple recipients
// @access  Private (Admin only)
router.post("/bulk", auth, sendBulkMessage);

// @route   GET /api/communications
// @desc    Get user messages
// @access  Private
router.get("/", auth, getUserMessages);

// @route   GET /api/communications/unread-count
// @desc    Get unread message count
// @access  Private
router.get("/unread-count", auth, getUnreadMessageCount);

// @route   GET /api/communications/search
// @desc    Search messages
// @access  Private
router.get("/search", auth, searchMessages);

// @route   GET /api/communications/thread/:threadId
// @desc    Get conversation thread
// @access  Private
router.get("/thread/:threadId", auth, getConversationThread);

// @route   GET /api/communications/:id
// @desc    Get message by ID
// @access  Private
router.get("/:id", auth, getMessageById);

// @route   PUT /api/communications/:id/read
// @desc    Mark message as read
// @access  Private
router.put("/:id/read", auth, markMessageAsRead);

// @route   DELETE /api/communications/:id
// @desc    Delete message
// @access  Private
router.delete("/:id", auth, deleteMessage);

module.exports = router; 