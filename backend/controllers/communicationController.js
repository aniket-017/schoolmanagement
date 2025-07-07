const Communication = require("../models/Communication");
const User = require("../models/User");

// @desc    Send message
// @route   POST /api/communications
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, messageType, subject, message, attachments, priority, parentMessageId } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Create thread ID if it's a reply
    let threadId = null;
    if (parentMessageId) {
      const parentMessage = await Communication.findById(parentMessageId);
      if (parentMessage) {
        threadId = parentMessage.threadId || parentMessage._id.toString();
      }
    }

    const communication = await Communication.create({
      senderId: req.user.id,
      receiverId,
      messageType: messageType || "direct",
      subject,
      message,
      attachments,
      priority: priority || "medium",
      parentMessageId,
      threadId,
    });

    await communication.populate([
      { path: "senderId", select: "name email role" },
      { path: "receiverId", select: "name email role" },
    ]);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: communication,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
};

// @desc    Get user messages
// @route   GET /api/communications
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const { type = "received", page = 1, limit = 10, isRead } = req.query;

    let filter = {};
    if (type === "received") {
      filter.receiverId = req.user.id;
    } else if (type === "sent") {
      filter.senderId = req.user.id;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const skip = (page - 1) * limit;

    const messages = await Communication.find(filter)
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Communication.countDocuments(filter);

    res.json({
      success: true,
      count: messages.length,
      total: totalMessages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      data: messages,
    });
  } catch (error) {
    console.error("Get user messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

// @desc    Get message by ID
// @route   GET /api/communications/:id
// @access  Private
const getMessageById = async (req, res) => {
  try {
    const message = await Communication.findById(req.params.id)
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .populate("parentMessageId");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is authorized to view this message
    if (message.senderId._id.toString() !== req.user.id && message.receiverId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Mark as read if it's the receiver viewing the message
    if (message.receiverId._id.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching message",
    });
  }
};

// @desc    Get conversation thread
// @route   GET /api/communications/thread/:threadId
// @access  Private
const getConversationThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const messages = await Communication.find({
      $or: [{ threadId }, { _id: threadId }],
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ sentAt: 1 });

    // Check if user is authorized to view this conversation
    const userIsInConversation = messages.some(
      (msg) => msg.senderId._id.toString() === req.user.id || msg.receiverId._id.toString() === req.user.id
    );

    if (!userIsInConversation) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get conversation thread error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching conversation thread",
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/communications/:id/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const message = await Communication.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the receiver
    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking message as read",
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/communications/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Communication.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is authorized to delete this message
    if (message.senderId.toString() !== req.user.id && message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Soft delete - mark as deleted
    message.isDeleted = true;
    await message.save();

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting message",
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/communications/unread-count
// @access  Private
const getUnreadMessageCount = async (req, res) => {
  try {
    const unreadCount = await Communication.countDocuments({
      receiverId: req.user.id,
      isRead: false,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Get unread message count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching unread message count",
    });
  }
};

// @desc    Search messages
// @route   GET /api/communications/search
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { query, messageType, priority, page = 1, limit = 10 } = req.query;

    let filter = {
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      isDeleted: false,
    };

    if (query) {
      filter.$or.push({ subject: { $regex: query, $options: "i" } }, { message: { $regex: query, $options: "i" } });
    }

    if (messageType) {
      filter.messageType = messageType;
    }

    if (priority) {
      filter.priority = priority;
    }

    const skip = (page - 1) * limit;

    const messages = await Communication.find(filter)
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Communication.countDocuments(filter);

    res.json({
      success: true,
      count: messages.length,
      total: totalMessages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      data: messages,
    });
  } catch (error) {
    console.error("Search messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching messages",
    });
  }
};

module.exports = {
  sendMessage,
  getUserMessages,
  getMessageById,
  getConversationThread,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
  searchMessages,
};
