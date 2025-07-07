const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Class = require("../models/Class");

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, announcement_type, priority, target_audience, class_ids, expiry_date, attachments } =
      req.body;

    // Validate required fields
    if (!title || !content || !announcement_type || !target_audience) {
      return res.status(400).json({
        success: false,
        message: "Title, content, announcement type, and target audience are required",
      });
    }

    // Validate target audience and class_ids
    if (target_audience === "class" && (!class_ids || class_ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Class IDs are required when target audience is "class"',
      });
    }

    const announcement = new Announcement({
      title,
      content,
      announcement_type,
      priority: priority || "medium",
      target_audience,
      class_ids: target_audience === "class" ? class_ids : [],
      created_by: req.user.id,
      expiry_date,
      attachments: attachments || [],
    });

    await announcement.save();
    await announcement.populate(["created_by", "class_ids"]);

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
};

// Get all announcements with filters
exports.getAnnouncements = async (req, res) => {
  try {
    const {
      announcement_type,
      priority,
      target_audience,
      class_id,
      status,
      active_only,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Build query filters
    if (announcement_type) query.announcement_type = announcement_type;
    if (priority) query.priority = priority;
    if (target_audience) query.target_audience = target_audience;
    if (class_id) query.class_ids = class_id;
    if (status) query.status = status;

    // Filter active announcements only
    if (active_only === "true") {
      query.status = "active";
      query.$or = [{ expiry_date: { $gt: new Date() } }, { expiry_date: { $exists: false } }];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("created_by", "name email")
      .populate("class_ids", "name section")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("created_by", "name email")
      .populate("class_ids", "name section");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcement",
      error: error.message,
    });
  }
};

// Get announcements for a specific user
exports.getAnnouncementsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { active_only, page = 1, limit = 10 } = req.query;

    const user = await User.findById(user_id).populate("class_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = {
      $or: [{ target_audience: "all" }, { target_audience: user.role }],
    };

    // Add class-specific announcements for students
    if (user.role === "student" && user.class_id) {
      query.$or.push({
        target_audience: "class",
        class_ids: user.class_id,
      });
    }

    // Filter active announcements only
    if (active_only === "true") {
      query.status = "active";
      query.$and = [
        {
          $or: [{ expiry_date: { $gt: new Date() } }, { expiry_date: { $exists: false } }],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("created_by", "name email")
      .populate("class_ids", "name section")
      .sort({ priority: 1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching user announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user announcements",
      error: error.message,
    });
  }
};

// Get announcements by class
exports.getAnnouncementsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { active_only, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { target_audience: "all" },
        { target_audience: "student" },
        { target_audience: "class", class_ids: class_id },
      ],
    };

    // Filter active announcements only
    if (active_only === "true") {
      query.status = "active";
      query.$and = [
        {
          $or: [{ expiry_date: { $gt: new Date() } }, { expiry_date: { $exists: false } }],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("created_by", "name email")
      .populate("class_ids", "name section")
      .sort({ priority: 1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching class announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class announcements",
      error: error.message,
    });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate target audience and class_ids if being updated
    if (updateData.target_audience === "class" && (!updateData.class_ids || updateData.class_ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Class IDs are required when target audience is "class"',
      });
    }

    const announcement = await Announcement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["created_by", "class_ids"]);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

// Update announcement status
exports.updateAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: active, inactive, expired",
      });
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate(["created_by", "class_ids"]);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement status updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error updating announcement status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating announcement status",
      error: error.message,
    });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
};

// Mark announcement as read for a user
exports.markAnnouncementAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Add user to read_by array if not already present
    if (!announcement.read_by.includes(user_id)) {
      announcement.read_by.push(user_id);
      await announcement.save();
    }

    res.json({
      success: true,
      message: "Announcement marked as read",
    });
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking announcement as read",
      error: error.message,
    });
  }
};

// Get announcement read status
exports.getAnnouncementReadStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate("read_by", "name email")
      .populate("class_ids", "name section");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Calculate read statistics
    let totalTargetUsers = 0;

    if (announcement.target_audience === "all") {
      totalTargetUsers = await User.countDocuments();
    } else if (announcement.target_audience === "class") {
      totalTargetUsers = await User.countDocuments({
        class_id: { $in: announcement.class_ids },
      });
    } else {
      totalTargetUsers = await User.countDocuments({
        role: announcement.target_audience,
      });
    }

    const readCount = announcement.read_by.length;
    const readPercentage = totalTargetUsers > 0 ? ((readCount / totalTargetUsers) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        announcement,
        read_statistics: {
          total_target_users: totalTargetUsers,
          read_count: readCount,
          unread_count: totalTargetUsers - readCount,
          read_percentage: readPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching announcement read status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcement read status",
      error: error.message,
    });
  }
};

// Get announcement statistics
exports.getAnnouncementStats = async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ status: "active" });
    const expiredAnnouncements = await Announcement.countDocuments({ status: "expired" });

    const announcementsByType = await Announcement.aggregate([
      { $group: { _id: "$announcement_type", count: { $sum: 1 } } },
    ]);

    const announcementsByPriority = await Announcement.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const announcementsByAudience = await Announcement.aggregate([
      { $group: { _id: "$target_audience", count: { $sum: 1 } } },
    ]);

    // Recent announcements
    const recentAnnouncements = await Announcement.find()
      .populate("created_by", "name")
      .sort({ created_at: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        total_announcements: totalAnnouncements,
        active_announcements: activeAnnouncements,
        expired_announcements: expiredAnnouncements,
        announcements_by_type: announcementsByType,
        announcements_by_priority: announcementsByPriority,
        announcements_by_audience: announcementsByAudience,
        recent_announcements: recentAnnouncements,
      },
    });
  } catch (error) {
    console.error("Error fetching announcement statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcement statistics",
      error: error.message,
    });
  }
};
