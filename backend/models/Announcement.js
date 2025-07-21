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

    // Enhanced Targeting
    targetAudience: {
      type: String,
      enum: ["all", "students", "teachers", "staff", "class", "individual"],
      default: "all",
    },
    targetClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    targetIndividuals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

    // Read tracking
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Pinning
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Scheduling
    scheduledFor: Date,
    isScheduled: {
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
  } else if (this.publishDate <= now && this.status === "draft" && !this.isScheduled) {
    this.status = "published";
  } else if (this.scheduledFor && this.scheduledFor <= now && this.status === "draft" && this.isScheduled) {
    this.status = "published";
    this.publishDate = now;
  }

  next();
});

// Create indexes
announcementSchema.index({ publishDate: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ targetClasses: 1 });
announcementSchema.index({ targetIndividuals: 1 });
announcementSchema.index({ isPinned: 1 });
announcementSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
