const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    // Publishing
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,

    // Targeting
    targetAudience: {
      type: String,
      enum: ["all", "students", "teachers", "staff"],
      default: "all",
    },
    targetClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    targetRoles: [String],

    // Content
    attachments: [String],
    images: [String],

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "expired", "archived"],
      default: "draft",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Engagement
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },

    // Notifications
    sendNotification: {
      type: Boolean,
      default: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on dates
announcementSchema.pre("save", function (next) {
  const now = new Date();

  if (this.expiryDate && now > this.expiryDate) {
    this.status = "expired";
  } else if (this.publishDate <= now && this.status === "draft") {
    this.status = "published";
  }

  next();
});

// Create indexes
announcementSchema.index({ publishDate: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ expiryDate: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
