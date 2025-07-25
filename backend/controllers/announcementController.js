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

    // Determine initial status - respect the status field if provided
    let status = req.body.status || "draft";
    let publishDate = new Date();

    if (isScheduled && scheduledFor) {
      status = "draft";
      publishDate = scheduledFor;
    } else if (!isScheduled && !req.body.status) {
      // Only auto-publish if no explicit status was provided
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

    // Send notifications if enabled
    if (sendNotification !== false && status === "published") {
      try {
        await sendAnnouncementNotifications(announcement);
        // Mark notification as sent
        announcement.notificationSent = true;
        await announcement.save();
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }

    if (targetAudience === "class") {
      // Find all students in the target classes
      const students = await User.find({ role: "student", class: { $in: targetClasses } }).select('_id name email');
      console.log('Announcement will be visible to students in classes:', targetClasses, 'Student IDs:', students.map(s => s._id));
    }
    if (targetAudience === "individual") {
      // Log the targeted individual students
      const students = await User.find({ _id: { $in: targetIndividuals }, role: "student" }).select('_id name email');
      console.log('Announcement will be visible to individual students:', students.map(s => s._id));
    }

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

    let query = {};

    // Role-based filtering
    if (req.user.role === 'teacher') {
      query.$or = [
        { createdBy: req.user._id },
        { targetAudience: 'teachers' },
        { targetAudience: 'all' },
        { targetAudience: 'class' }, // Teachers should see class announcements they created
      ];
    } else if (req.user.role === 'student') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetIndividuals: req.user._id },
      ];
      
      // Add class-specific announcements if student has a class
      if (req.user.class) {
        query.$or.push({
          targetAudience: 'class',
          targetClasses: req.user.class._id || req.user.class,
        });
      }
    } else if (req.user.role === 'admin') {
      // Admins see all announcements
      query = {};
    }

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
      query.$or = query.$or || [];
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
        { targetAudience: "class" }, // Teachers should see class announcements they created
        { createdBy: req.user._id }, // Always include announcements created by this teacher
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

    // Handle scheduling logic - respect explicit status if provided
    if (updateData.isScheduled && updateData.scheduledFor) {
      updateData.status = "draft";
      updateData.publishDate = updateData.scheduledFor;
    } else if (updateData.isScheduled === false && !req.body.status) {
      // Only auto-publish if no explicit status was provided
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

    // Send notifications if status changed to published and notifications are enabled
    if (updateData.status === "published" && announcement.sendNotification && !announcement.notificationSent) {
      try {
        await sendAnnouncementNotifications(announcement);
        // Mark notification as sent
        announcement.notificationSent = true;
        await announcement.save();
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
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

// Get announcements for a specific student (using Student collection)
exports.getAnnouncementsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { activeOnly, page = 1, limit = 10 } = req.query;

    if (!studentId || studentId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Use Student collection
    const Student = require("../models/Student");
    const student = await Student.findById(studentId).populate("class");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const query = {
      $or: [
        { targetAudience: "all" },
        { targetAudience: "students" },
        { targetIndividuals: studentId },
      ],
    };
    // Add class-specific announcements for students
    if (student.class) {
      query.$or.push({
        targetAudience: "class",
        targetClasses: student.class._id || student.class,
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
    console.error("Error fetching student announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student announcements",
      error: error.message,
    });
  }
};

// Helper function to send announcement notifications
const sendAnnouncementNotifications = async (announcement) => {
  try {
    const teacherName = announcement.createdBy?.name || "Teacher";
    const notificationTitle = `New Announcement from ${teacherName}`;
    const notificationBody = `${announcement.title}\n\n${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}`;
    
    let targetUsers = [];
    let targetStudents = [];

    // Import Student model once at the top
    const Student = require("../models/Student");

    // Determine target users based on audience
    switch (announcement.targetAudience) {
      case "all":
        // Get teachers and admins from User collection
        targetUsers = await User.find({ role: { $in: ["teacher", "admin"] } }).select('_id name email role');
        // Get students from Student collection
        targetStudents = await Student.find({ isActive: true }).select('_id name email');
        break;
      case "students":
        // Get students from Student collection
        targetStudents = await Student.find({ isActive: true }).select('_id name email');
        break;
      case "teachers":
        targetUsers = await User.find({ role: "teacher" }).select('_id name email role');
        break;
      case "class":
        if (announcement.targetClasses && announcement.targetClasses.length > 0) {
          // Get students from Student collection for specific classes
          targetStudents = await Student.find({ 
            class: { $in: announcement.targetClasses.map(c => c._id || c) },
            isActive: true
          }).select('_id name email');
        }
        break;
      case "individual":
        if (announcement.targetIndividuals && announcement.targetIndividuals.length > 0) {
          // Check both User and Student collections for individual targeting
          targetUsers = await User.find({ 
            _id: { $in: announcement.targetIndividuals.map(u => u._id || u) } 
          }).select('_id name email role');
          
          targetStudents = await Student.find({ 
            _id: { $in: announcement.targetIndividuals.map(u => u._id || u) },
            isActive: true
          }).select('_id name email');
        }
        break;
    }

    // Log notification details
    console.log(`📢 Sending notification: "${notificationTitle}"`);
    console.log(`📝 Content: ${notificationBody}`);
    console.log(`👥 Target users: ${targetUsers.length} users`);
    console.log(`👥 Target students: ${targetStudents.length} students`);
    console.log(`👨‍🏫 Teacher: ${teacherName}`);

    // Here you would integrate with your notification service
    // For now, we'll just log the notification details
    
    // Send to teachers/admins
    for (const user of targetUsers) {
      console.log(`📱 Sending to ${user.name} (${user.email}) - ${user.role}`);
      
      // TODO: Integrate with actual notification services like:
      // - Firebase Cloud Messaging (FCM) for push notifications
      // - Email service (SendGrid, Nodemailer) for email notifications
      // - SMS service for text messages
      
      // Example FCM integration (commented out):
      /*
      await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: {
          announcementId: announcement._id.toString(),
          teacherName: teacherName,
          priority: announcement.priority,
        },
      });
      */
    }
    
    // Send to students
    for (const student of targetStudents) {
      console.log(`📱 Sending to student ${student.name} (${student.email})`);
      
      // TODO: Integrate with actual notification services for students
      // - Firebase Cloud Messaging (FCM) for push notifications
      // - Email service (SendGrid, Nodemailer) for email notifications
      // - SMS service for text messages
      
      // Example FCM integration for students (commented out):
      /*
      await admin.messaging().send({
        token: student.fcmToken,
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: {
          announcementId: announcement._id.toString(),
          teacherName: teacherName,
          priority: announcement.priority,
        },
      });
      */
    }

    console.log(`✅ Notification sent successfully to ${targetUsers.length} users and ${targetStudents.length} students`);
  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    throw error;
  }
};
