const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
    },
    
    // Message Details
    messageType: {
      type: String,
      enum: ["direct", "announcement", "complaint", "inquiry", "notification", "reminder"],
      default: "direct",
    },
    subject: String,
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    attachments: [String],
    
    // Threading
    threadId: String,
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
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

// Generate thread ID for new conversations
communicationSchema.pre("save", function (next) {
  if (this.isNew && !this.threadId && !this.parentMessageId) {
    this.threadId = this._id.toString();
  }
  
  // Mark as read when read
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  next();
});

// Create indexes
communicationSchema.index({ senderId: 1, receiverId: 1 });
communicationSchema.index({ threadId: 1 });
communicationSchema.index({ isRead: 1 });
communicationSchema.index({ receiverId: 1, isRead: 1 });
communicationSchema.index({ sentAt: 1 });

module.exports = mongoose.model("Communication", communicationSchema); 