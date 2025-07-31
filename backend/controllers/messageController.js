const Message = require("../models/Message");
const User = require("../models/User");
const Student = require("../models/Student");

// @desc    Send fee reminder message to student
// @route   POST /api/messages/fee-reminder
// @access  Private (Admin only)
const sendFeeReminder = async (req, res) => {
  try {
    const { 
      studentId, 
      subject, 
      message, 
      feeAmount, 
      feeType, 
      dueDate, 
      remainingAmount,
      priority = "medium" 
    } = req.body;

    // Validate required fields
    if (!studentId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Student ID, subject, and message are required",
      });
    }

    // Find the student in Student model
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create the fee reminder message directly to Student
    const feeReminderMessage = await Message.create({
      senderId: req.user.id,
      receiverId: studentId, // Use studentId directly
      messageType: "fee_reminder",
      subject,
      message,
      feeAmount: feeAmount || null,
      feeType: feeType || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      remainingAmount: remainingAmount || null,
      priority,
    });

    await feeReminderMessage.populate([
      { path: "senderId", select: "name email role" },
      { path: "receiverId", select: "name firstName lastName email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Fee reminder sent successfully",
      data: feeReminderMessage,
    });
  } catch (error) {
    console.error("Send fee reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending fee reminder",
    });
  }
};

// @desc    Get messages for a student
// @route   GET /api/messages
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, messageType, isRead } = req.query;
    const skip = (page - 1) * limit;

    // For students, we need to get the student ID from the auth context
    // The student auth should provide the student ID
    const studentId = req.user.id; // This should be the student ID from auth

    console.log("Getting messages for student ID:", studentId);

    const query = {
      receiverId: studentId,
      isDeleted: false,
    };

    if (messageType) {
      query.messageType = messageType;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    console.log("Message query:", query);

    const messages = await Message.find(query)
      .populate("senderId", "name email role")
      .populate("receiverId", "name firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    console.log("Found messages:", messages.length);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const studentId = req.user.id; // This should be the student ID from auth
    
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiverId: studentId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking message as read",
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadMessageCount = async (req, res) => {
  try {
    const studentId = req.user.id; // This should be the student ID from auth
    const count = await Message.countDocuments({
      receiverId: studentId,
      isRead: false,
      isDeleted: false,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting unread count",
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const studentId = req.user.id; // This should be the student ID from auth
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiverId: studentId },
      { isDeleted: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

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

module.exports = {
  sendFeeReminder,
  getUserMessages,
  markMessageAsRead,
  getUnreadMessageCount,
  deleteMessage,
}; 