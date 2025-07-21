const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Class = require("../models/Class");

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      priority,
      targetAudience,
      targetClasses,
      targetIndividuals,
      expiryDate,
      attachments,
      images,
      sendNotification,
      isPinned,
      scheduledFor,
      isScheduled,
    } = req.body;

    // Validate required fields
    if (!title || !content || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and target audience are required",
      });
    }

    // Validate target audience and related fields
    if (targetAudience === "class" && (!targetClasses || targetClasses.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Class IDs are required when target audience is "class"',
      });
    }

    if (targetAudience === "individual" && (!targetIndividuals || targetIndividuals.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Individual user IDs are required when target audience is "individual"',
      });
    }

    // Determine initial status
    let status = "draft";
    let publishDate = new Date();

    if (isScheduled && scheduledFor) {
      status = "draft";
      publishDate = scheduledFor;
    } else if (!isScheduled) {
      status = "published";
    }

    const announcement = new Announcement({
      title,
      content,
      priority: priority || "medium",
      targetAudience,
      targetClasses: targetAudience === "class" ? targetClasses : [],
      targetIndividuals: targetAudience === "individual" ? targetIndividuals : [],
      createdBy: req.user.id,
      publishDate,
      expiryDate,
      attachments: attachments || [],
      images: images || [],
      sendNotification: sendNotification !== false,
      isPinned: isPinned || false,
      scheduledFor,
      isScheduled: isScheduled || false,
      status,
    });

    await announcement.save();
    await announcement.populate([
      { path: "createdBy", select: "name email" },
      { path: "targetClasses", select: "name section" },
      { path: "targetIndividuals", select: "name email role" },
    ]);

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
      targetAudience,
      priority,
      status,
      isPinned,
      classId,
      individualId,
      activeOnly,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Build query filters
    if (targetAudience) query.targetAudience = targetAudience;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (isPinned !== undefined) query.isPinned = isPinned === "true";
    if (classId) query.targetClasses = classId;
    if (individualId) query.targetIndividuals = individualId;

    // Filter active announcements only
    if (activeOnly === "true") {
      query.status = "published";
      query.$or = [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: { $exists: false } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role")
      .sort(sortOptions)
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
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role")
      .populate("readBy.user", "name email");

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
    const { userId } = req.params;
    const { activeOnly, page = 1, limit = 10 } = req.query;

    console.log("getAnnouncementsForUser called with userId:", userId);
    console.log("userId type:", typeof userId);

    if (!userId || userId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId).populate("class");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = {
      $or: [
        { targetAudience: "all" },
        { targetAudience: user.role },
        { targetIndividuals: userId },
      ],
    };

    // Add class-specific announcements for students
    if (user.role === "student" && user.class) {
      query.$or.push({
        targetAudience: "class",
        targetClasses: user.class._id,
      });
    }

    // Filter active announcements only
    if (activeOnly === "true") {
      query.status = "published";
      query.$and = [
        {
          $or: [
            { expiryDate: { $gt: new Date() } },
            { expiryDate: { $exists: false } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role")
      .sort({ isPinned: -1, priority: 1, createdAt: -1 })
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

// Get announcements for teachers (simplified endpoint)
exports.getTeacherAnnouncements = async (req, res) => {
  try {
    const { activeOnly = "true", page = 1, limit = 10 } = req.query;

    console.log("getTeacherAnnouncements called");

    const query = {
      $or: [
        { targetAudience: "all" },
        { targetAudience: "teachers" },
      ],
    };

    // Filter active announcements only
    if (activeOnly === "true") {
      query.status = "published";
      query.$and = [
        {
          $or: [
            { expiryDate: { $gt: new Date() } },
            { expiryDate: { $exists: false } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role")
      .sort({ isPinned: -1, priority: 1, createdAt: -1 })
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
    console.error("Error fetching teacher announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher announcements",
      error: error.message,
    });
  }
};

// Get announcements by class
exports.getAnnouncementsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { activeOnly, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { targetAudience: "all" },
        { targetAudience: "students" },
        { targetAudience: "class", targetClasses: classId },
      ],
    };

    // Filter active announcements only
    if (activeOnly === "true") {
      query.status = "published";
      query.$and = [
        {
          $or: [
            { expiryDate: { $gt: new Date() } },
            { expiryDate: { $exists: false } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role")
      .sort({ isPinned: -1, priority: 1, createdAt: -1 })
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

    // Validate target audience and related fields
    if (updateData.targetAudience === "class" && (!updateData.targetClasses || updateData.targetClasses.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Class IDs are required when target audience is "class"',
      });
    }

    if (updateData.targetAudience === "individual" && (!updateData.targetIndividuals || updateData.targetIndividuals.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Individual user IDs are required when target audience is "individual"',
      });
    }

    // Handle scheduling logic
    if (updateData.isScheduled && updateData.scheduledFor) {
      updateData.status = "draft";
      updateData.publishDate = updateData.scheduledFor;
    } else if (updateData.isScheduled === false) {
      updateData.status = "published";
      updateData.publishDate = new Date();
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role");

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

    if (!["draft", "published", "archived", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: draft, published, archived, expired",
      });
    }

    const updateData = { status };

    // If publishing, set publish date
    if (status === "published") {
      updateData.publishDate = new Date();
      updateData.isScheduled = false;
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role");

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

// Toggle announcement pin status
exports.toggleAnnouncementPin = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    await announcement.populate([
      { path: "createdBy", select: "name email" },
      { path: "targetClasses", select: "name section" },
      { path: "targetIndividuals", select: "name email role" },
    ]);

    res.json({
      success: true,
      message: `Announcement ${announcement.isPinned ? "pinned" : "unpinned"} successfully`,
      data: announcement,
    });
  } catch (error) {
    console.error("Error toggling announcement pin:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling announcement pin",
      error: error.message,
    });
  }
};

// Mark announcement as read
exports.markAnnouncementAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check if already read
    const alreadyRead = announcement.readBy.find(
      (read) => read.user.toString() === userId
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      announcement.views += 1;
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

// Get announcement read status
exports.getAnnouncementReadStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate("readBy.user", "name email")
      .populate("targetClasses", "name section")
      .populate("targetIndividuals", "name email role");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Calculate read statistics
    let totalTargetUsers = 0;

    if (announcement.targetAudience === "all") {
      totalTargetUsers = await User.countDocuments();
    } else if (announcement.targetAudience === "class") {
      totalTargetUsers = await User.countDocuments({
        classId: { $in: announcement.targetClasses },
      });
    } else if (announcement.targetAudience === "individual") {
      totalTargetUsers = announcement.targetIndividuals.length;
    } else {
      totalTargetUsers = await User.countDocuments({
        role: announcement.targetAudience,
      });
    }

    const readCount = announcement.readBy.length;
    const readPercentage = totalTargetUsers > 0 ? ((readCount / totalTargetUsers) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        announcement,
        readStatistics: {
          totalTargetUsers,
          readCount,
          unreadCount: totalTargetUsers - readCount,
          readPercentage,
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
    const publishedAnnouncements = await Announcement.countDocuments({ status: "published" });
    const draftAnnouncements = await Announcement.countDocuments({ status: "draft" });
    const expiredAnnouncements = await Announcement.countDocuments({ status: "expired" });
    const pinnedAnnouncements = await Announcement.countDocuments({ isPinned: true });

    const announcementsByType = await Announcement.aggregate([
      { $group: { _id: "$targetAudience", count: { $sum: 1 } } },
    ]);

    const announcementsByPriority = await Announcement.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const announcementsByStatus = await Announcement.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Recent announcements
    const recentAnnouncements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Most viewed announcements
    const mostViewedAnnouncements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ views: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalAnnouncements,
        publishedAnnouncements,
        draftAnnouncements,
        expiredAnnouncements,
        pinnedAnnouncements,
        announcementsByType,
        announcementsByPriority,
        announcementsByStatus,
        recentAnnouncements,
        mostViewedAnnouncements,
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

// Get users for individual targeting
exports.getUsersForTargeting = async (req, res) => {
  try {
    const { role, classId, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (classId) query.classId = classId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email role classId")
      .populate("classId", "name section")
      .limit(50);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users for targeting:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users for targeting",
      error: error.message,
    });
  }
};
