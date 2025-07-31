const Communication = require("../models/Communication");
const User = require("../models/User");

// @desc    Send message
// @route   POST /api/communications
// @access  Private
const sendMessage = async (req, res) => {
  try {
    console.log("Individual message request:", req.body);
    const { receiverId, messageType, subject, message, attachments, priority, parentMessageId, feeAmount, feeType, dueDate, type } = req.body;

    // Check if receiver exists (can be User ID or Student ID)
    let receiver = await User.findById(receiverId);
    let isStudentModel = false;
    
    if (!receiver) {
      // Try to find as Student
      const Student = require("../models/Student");
      receiver = await Student.findById(receiverId);
      isStudentModel = true;
      
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: "Receiver not found",
        });
      }
    }

    // Create thread ID if it's a reply
    let threadId = null;
    if (parentMessageId) {
      const parentMessage = await Communication.findById(parentMessageId);
      if (parentMessage) {
        threadId = parentMessage.threadId || parentMessage._id.toString();
      }
    }

    // For Student model, we need to create a User record or use a different approach
    let communicationReceiverId = receiverId;
    
    if (isStudentModel) {
      console.log(`Processing student: ${receiver.name || receiver.firstName} (Student ID: ${receiver._id})`);
      
      // Create a User record for the student if it doesn't exist
      let userRecord = await User.findOne({ studentId: receiver.studentId || receiver.rollNumber });
      
      if (!userRecord) {
        // Check if a user with the student's email already exists
        if (receiver.email) {
          userRecord = await User.findOne({ email: receiver.email });
        }
        
        if (!userRecord) {
          // Create a basic User record for the student
          try {
            userRecord = await User.create({
              name: receiver.name || `${receiver.firstName} ${receiver.lastName}`,
              email: receiver.email || `student.${receiver.studentId || receiver.rollNumber}@school.com`,
              password: "tempPassword123", // This should be changed by the student
              role: "student",
              class: receiver.class,
              studentId: receiver.studentId || receiver.rollNumber,
              phone: receiver.mobileNumber,
            });
            console.log(`Created new User record for student: ${receiver.name || receiver.firstName} (User ID: ${userRecord._id})`);
          } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
              // Email already exists, try to find the user with this email
              userRecord = await User.findOne({ email: receiver.email || `student.${receiver.studentId || receiver.rollNumber}@school.com` });
              if (!userRecord) {
                return res.status(400).json({
                  success: false,
                  message: "Failed to create user record for student",
                });
              }
              console.log(`Found existing User record for student: ${receiver.name || receiver.firstName} (User ID: ${userRecord._id})`);
            } else {
              return res.status(500).json({
                success: false,
                message: "Error creating user record for student",
              });
            }
          }
        } else {
          console.log(`Found existing User record by studentId: ${receiver.name || receiver.firstName} (User ID: ${userRecord._id})`);
        }
      } else {
        console.log(`Found existing User record by studentId: ${receiver.name || receiver.firstName} (User ID: ${userRecord._id})`);
      }
      
      communicationReceiverId = userRecord._id;
      console.log(`Using User ID for communication: ${communicationReceiverId}`);
    }

    const communication = await Communication.create({
      senderId: req.user.id,
      receiverId: communicationReceiverId,
      messageType: messageType || "direct",
      subject,
      message,
      attachments,
      priority: priority || "medium",
      parentMessageId,
      threadId,
      // Store fee information if provided
      feeAmount: feeAmount || null,
      feeType: feeType || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      type: type || null,
    });

    await communication.populate([
      { path: "senderId", select: "name email role" },
      { path: "receiverId", select: "name email role" },
    ]);

    console.log("Message sent successfully to:", {
      receiverId: communicationReceiverId,
      receiverName: communication.receiverId?.name || communication.receiverId?.firstName,
      messageType: communication.messageType,
      messageId: communication._id,
      senderId: req.user.id,
      senderName: req.user.name
    });

    // Check if there are any other User records with the same studentId (debugging)
    if (isStudentModel) {
      const duplicateUsers = await User.find({ 
        studentId: receiver.studentId || receiver.rollNumber,
        _id: { $ne: communicationReceiverId }
      });
      if (duplicateUsers.length > 0) {
        console.log(`⚠️ WARNING: Found ${duplicateUsers.length} duplicate User records for student ${receiver.name || receiver.firstName}`);
        duplicateUsers.forEach(user => {
          console.log(`  - User ID: ${user._id}, Email: ${user.email}`);
        });
      }
    }

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

// @desc    Send bulk message to multiple recipients
// @route   POST /api/communications/bulk
// @access  Private (Admin only)
const sendBulkMessage = async (req, res) => {
  try {
    console.log("Bulk message request:", req.body);
    const { recipients, subject, message, type = "fee_reminder" } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients array is required",
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    // Verify all recipients exist (can be Student IDs or User IDs)
    const Student = require("../models/Student");
    
    // First try to find as User IDs
    let recipientsData = await User.find({
      _id: { $in: recipients },
      role: "student",
    });

    // If not found as users, try as Student IDs
    if (recipientsData.length === 0) {
      recipientsData = await Student.find({
        _id: { $in: recipients },
      });
      console.log("Found recipients as Student IDs:", recipientsData.length);
    } else {
      console.log("Found recipients as User IDs:", recipientsData.length);
    }

    if (recipientsData.length !== recipients.length) {
      return res.status(400).json({
        success: false,
        message: `Some recipients not found. Expected ${recipients.length}, found ${recipientsData.length}`,
      });
    }

    // Create communications for all recipients
    const communications = [];
    
    for (const recipientId of recipients) {
      // Find the recipient (could be User or Student)
      let recipient = await User.findById(recipientId);
      let isStudentModel = false;
      
      if (!recipient) {
        // Try to find as Student
        recipient = await Student.findById(recipientId);
        isStudentModel = true;
      }
      
      if (!recipient) {
        console.log("Recipient not found:", recipientId);
        continue;
      }
      
      console.log(`Processing recipient: ${recipient.name || recipient.firstName} (${recipient.email})`);
      
      // For Student model, we need to create a User record or use a different approach
      let communicationReceiverId = recipientId;
      
      if (isStudentModel) {
        // Create a User record for the student if it doesn't exist
        let userRecord = await User.findOne({ studentId: recipient.studentId || recipient.rollNumber });
        
        if (!userRecord) {
          // Check if a user with the student's email already exists
          if (recipient.email) {
            userRecord = await User.findOne({ email: recipient.email });
          }
          
          if (!userRecord) {
            // Create a basic User record for the student
            try {
              userRecord = await User.create({
                name: recipient.name || `${recipient.firstName} ${recipient.lastName}`,
                email: recipient.email || `student.${recipient.studentId || recipient.rollNumber}@school.com`,
                password: "tempPassword123", // This should be changed by the student
                role: "student",
                class: recipient.class,
                studentId: recipient.studentId || recipient.rollNumber,
                phone: recipient.mobileNumber,
              });
            } catch (error) {
              if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                // Email already exists, try to find the user with this email
                userRecord = await User.findOne({ email: recipient.email || `student.${recipient.studentId || recipient.rollNumber}@school.com` });
                if (!userRecord) {
                  console.log("Failed to create user record for student:", recipientId);
                  continue; // Skip this recipient
                }
              } else {
                console.log("Error creating user record:", error);
                continue; // Skip this recipient
              }
            }
          }
        }
        
        communicationReceiverId = userRecord._id;
      }
      
      // Create communication
      const communication = await Communication.create({
        senderId: req.user.id,
        receiverId: communicationReceiverId,
        messageType: "bulk",
        subject,
        message,
        priority: "medium",
        type,
      });
      communications.push(communication);
    }

    // Populate sender and receiver details
    await Communication.populate(communications, [
      { path: "senderId", select: "name email role" },
      { path: "receiverId", select: "name email role" },
    ]);

    res.status(201).json({
      success: true,
      message: `Message sent successfully to ${recipients.length} recipients`,
      data: {
        sentCount: communications.length,
        communications,
      },
    });
  } catch (error) {
    console.error("Send bulk message error:", error);
    
    // Provide more specific error messages
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Duplicate key error - a user with this email already exists",
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error while sending bulk message",
        error: error.message
      });
    }
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

// @desc    Debug endpoint to check user records for students
// @route   GET /api/communications/debug/students
// @access  Private (Admin only)
const debugStudentUsers = async (req, res) => {
  try {
    const Student = require("../models/Student");
    
    // Get all students
    const students = await Student.find({}).limit(10);
    
    const debugData = [];
    
    for (const student of students) {
      // Find User records for this student
      const userRecords = await User.find({
        $or: [
          { studentId: student.studentId || student.rollNumber },
          { email: student.email }
        ]
      });
      
      debugData.push({
        studentId: student._id,
        studentName: student.name || `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        userRecords: userRecords.map(user => ({
          userId: user._id,
          userEmail: user.email,
          userStudentId: user.studentId
        }))
      });
    }
    
    res.json({
      success: true,
      data: debugData
    });
  } catch (error) {
    console.error("Debug student users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while debugging student users",
    });
  }
};

module.exports = {
  sendMessage,
  sendBulkMessage,
  getUserMessages,
  getMessageById,
  getConversationThread,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
  searchMessages,
  debugStudentUsers,
};
