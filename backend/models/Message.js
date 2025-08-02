const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Receiver ID is required"],
    },
    
    // Message Details
    messageType: {
      type: String,
      enum: ["fee_reminder", "general", "notification", "urgent"],
      default: "general",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    
    // Fee-specific fields
    feeAmount: {
      type: Number,
      default: null,
    },
    feeType: {
      type: String,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    remainingAmount: {
      type: Number,
      default: null,
    },
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    
    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    
    // Delivery
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: Date,
    
    // Flags
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema); 