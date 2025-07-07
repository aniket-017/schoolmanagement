const SyllabusTracking = require("../models/SyllabusTracking");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");

// Create syllabus tracking entry
exports.createSyllabusTracking = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, topic, chapter, planned_date, actual_date, status, notes } = req.body;

    // Validate required fields
    if (!class_id || !subject_id || !teacher_id || !topic || !planned_date) {
      return res.status(400).json({
        success: false,
        message: "Class ID, subject ID, teacher ID, topic, and planned date are required",
      });
    }

    // Verify teacher exists and has teacher role
    const teacher = await User.findById(teacher_id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Check if topic already exists for this class and subject
    const existingTopic = await SyllabusTracking.findOne({
      class_id,
      subject_id,
      topic: topic.trim(),
    });

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: "Topic already exists for this class and subject",
      });
    }

    const syllabusTracking = new SyllabusTracking({
      class_id,
      subject_id,
      teacher_id,
      topic: topic.trim(),
      chapter,
      planned_date,
      actual_date,
      status: status || "pending",
      notes,
    });

    await syllabusTracking.save();
    await syllabusTracking.populate(["class_id", "subject_id", "teacher_id"]);

    res.status(201).json({
      success: true,
      message: "Syllabus tracking entry created successfully",
      data: syllabusTracking,
    });
  } catch (error) {
    console.error("Error creating syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating syllabus tracking entry",
      error: error.message,
    });
  }
};

// Get all syllabus tracking entries with filters
exports.getSyllabusTracking = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, status, chapter, start_date, end_date, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (class_id) query.class_id = class_id;
    if (subject_id) query.subject_id = subject_id;
    if (teacher_id) query.teacher_id = teacher_id;
    if (status) query.status = status;
    if (chapter) query.chapter = new RegExp(chapter, "i");

    // Date range filter
    if (start_date || end_date) {
      query.planned_date = {};
      if (start_date) query.planned_date.$gte = new Date(start_date);
      if (end_date) query.planned_date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    const syllabusEntries = await SyllabusTracking.find(query)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .populate("teacher_id", "name email")
      .sort({ planned_date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SyllabusTracking.countDocuments(query);

    res.json({
      success: true,
      data: syllabusEntries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching syllabus tracking entries",
      error: error.message,
    });
  }
};

// Get syllabus tracking by ID
exports.getSyllabusTrackingById = async (req, res) => {
  try {
    const syllabusTracking = await SyllabusTracking.findById(req.params.id)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .populate("teacher_id", "name email");

    if (!syllabusTracking) {
      return res.status(404).json({
        success: false,
        message: "Syllabus tracking entry not found",
      });
    }

    res.json({
      success: true,
      data: syllabusTracking,
    });
  } catch (error) {
    console.error("Error fetching syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching syllabus tracking entry",
      error: error.message,
    });
  }
};

// Get syllabus progress by class and subject
exports.getSyllabusProgress = async (req, res) => {
  try {
    const { class_id, subject_id } = req.params;

    const syllabusEntries = await SyllabusTracking.find({
      class_id,
      subject_id,
    })
      .populate("teacher_id", "name")
      .sort({ planned_date: 1 });

    // Calculate progress statistics
    const totalTopics = syllabusEntries.length;
    const completedTopics = syllabusEntries.filter((entry) => entry.status === "completed").length;
    const inProgressTopics = syllabusEntries.filter((entry) => entry.status === "in_progress").length;
    const pendingTopics = syllabusEntries.filter((entry) => entry.status === "pending").length;
    const skippedTopics = syllabusEntries.filter((entry) => entry.status === "skipped").length;

    const progressPercentage = totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(2) : 0;

    // Group by chapter
    const chapterProgress = {};
    syllabusEntries.forEach((entry) => {
      const chapter = entry.chapter || "Uncategorized";
      if (!chapterProgress[chapter]) {
        chapterProgress[chapter] = {
          total: 0,
          completed: 0,
          in_progress: 0,
          pending: 0,
          skipped: 0,
        };
      }
      chapterProgress[chapter].total++;
      chapterProgress[chapter][entry.status]++;
    });

    // Calculate delays
    const currentDate = new Date();
    const delayedTopics = syllabusEntries.filter(
      (entry) =>
        entry.status !== "completed" && entry.status !== "skipped" && new Date(entry.planned_date) < currentDate
    ).length;

    res.json({
      success: true,
      data: {
        syllabus_entries: syllabusEntries,
        progress: {
          total_topics: totalTopics,
          completed_topics: completedTopics,
          in_progress_topics: inProgressTopics,
          pending_topics: pendingTopics,
          skipped_topics: skippedTopics,
          delayed_topics: delayedTopics,
          progress_percentage: progressPercentage,
        },
        chapter_progress: chapterProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching syllabus progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching syllabus progress",
      error: error.message,
    });
  }
};

// Get teacher's syllabus progress
exports.getTeacherSyllabusProgress = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const { class_id, subject_id } = req.query;

    const query = { teacher_id };
    if (class_id) query.class_id = class_id;
    if (subject_id) query.subject_id = subject_id;

    const syllabusEntries = await SyllabusTracking.find(query)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .sort({ planned_date: 1 });

    // Group by class and subject
    const classSubjectProgress = {};
    syllabusEntries.forEach((entry) => {
      const key = `${entry.class_id.name}-${entry.class_id.section}_${entry.subject_id.name}`;
      if (!classSubjectProgress[key]) {
        classSubjectProgress[key] = {
          class: entry.class_id,
          subject: entry.subject_id,
          total: 0,
          completed: 0,
          in_progress: 0,
          pending: 0,
          skipped: 0,
          delayed: 0,
        };
      }
      classSubjectProgress[key].total++;
      classSubjectProgress[key][entry.status]++;

      // Check for delays
      const currentDate = new Date();
      if (entry.status !== "completed" && entry.status !== "skipped" && new Date(entry.planned_date) < currentDate) {
        classSubjectProgress[key].delayed++;
      }
    });

    // Calculate overall progress
    const totalTopics = syllabusEntries.length;
    const completedTopics = syllabusEntries.filter((entry) => entry.status === "completed").length;
    const overallProgress = totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overall_progress: overallProgress,
        total_topics: totalTopics,
        completed_topics: completedTopics,
        class_subject_progress: Object.values(classSubjectProgress),
        recent_entries: syllabusEntries.slice(-10),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher syllabus progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher syllabus progress",
      error: error.message,
    });
  }
};

// Update syllabus tracking entry
exports.updateSyllabusTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If status is being updated to completed, set actual_date if not provided
    if (updateData.status === "completed" && !updateData.actual_date) {
      updateData.actual_date = new Date();
    }

    const syllabusTracking = await SyllabusTracking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["class_id", "subject_id", "teacher_id"]);

    if (!syllabusTracking) {
      return res.status(404).json({
        success: false,
        message: "Syllabus tracking entry not found",
      });
    }

    res.json({
      success: true,
      message: "Syllabus tracking entry updated successfully",
      data: syllabusTracking,
    });
  } catch (error) {
    console.error("Error updating syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating syllabus tracking entry",
      error: error.message,
    });
  }
};

// Update topic status
exports.updateTopicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["pending", "in_progress", "completed", "skipped"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, in_progress, completed, skipped",
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    // Set actual_date if status is completed
    if (status === "completed") {
      updateData.actual_date = new Date();
    }

    const syllabusTracking = await SyllabusTracking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["class_id", "subject_id", "teacher_id"]);

    if (!syllabusTracking) {
      return res.status(404).json({
        success: false,
        message: "Syllabus tracking entry not found",
      });
    }

    res.json({
      success: true,
      message: "Topic status updated successfully",
      data: syllabusTracking,
    });
  } catch (error) {
    console.error("Error updating topic status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating topic status",
      error: error.message,
    });
  }
};

// Delete syllabus tracking entry
exports.deleteSyllabusTracking = async (req, res) => {
  try {
    const syllabusTracking = await SyllabusTracking.findByIdAndDelete(req.params.id);

    if (!syllabusTracking) {
      return res.status(404).json({
        success: false,
        message: "Syllabus tracking entry not found",
      });
    }

    res.json({
      success: true,
      message: "Syllabus tracking entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting syllabus tracking entry",
      error: error.message,
    });
  }
};

// Bulk update syllabus tracking entries
exports.bulkUpdateSyllabusTracking = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required and must not be empty",
      });
    }

    const updatePromises = updates.map(async (update) => {
      const { id, status, notes } = update;

      const updateData = { status };
      if (notes) updateData.notes = notes;
      if (status === "completed") updateData.actual_date = new Date();

      return SyllabusTracking.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    });

    const updatedEntries = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${updatedEntries.length} syllabus tracking entries updated successfully`,
      data: updatedEntries,
    });
  } catch (error) {
    console.error("Error bulk updating syllabus tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating syllabus tracking entries",
      error: error.message,
    });
  }
};

// Get syllabus tracking statistics
exports.getSyllabusTrackingStats = async (req, res) => {
  try {
    const totalEntries = await SyllabusTracking.countDocuments();

    const statusStats = await SyllabusTracking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const teacherStats = await SyllabusTracking.aggregate([
      {
        $group: {
          _id: "$teacher_id",
          topics: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "teacher" } },
      { $unwind: "$teacher" },
      {
        $project: {
          teacher_name: "$teacher.name",
          topics: 1,
          completed: 1,
          progress: { $multiply: [{ $divide: ["$completed", "$topics"] }, 100] },
        },
      },
      { $sort: { progress: -1 } },
    ]);

    const classStats = await SyllabusTracking.aggregate([
      {
        $group: {
          _id: "$class_id",
          topics: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      { $lookup: { from: "classes", localField: "_id", foreignField: "_id", as: "class" } },
      { $unwind: "$class" },
      {
        $project: {
          class_name: "$class.name",
          section: "$class.section",
          topics: 1,
          completed: 1,
          progress: { $multiply: [{ $divide: ["$completed", "$topics"] }, 100] },
        },
      },
      { $sort: { progress: -1 } },
    ]);

    // Calculate delays
    const currentDate = new Date();
    const delayedEntries = await SyllabusTracking.countDocuments({
      status: { $nin: ["completed", "skipped"] },
      planned_date: { $lt: currentDate },
    });

    res.json({
      success: true,
      data: {
        total_entries: totalEntries,
        status_distribution: statusStats,
        delayed_entries: delayedEntries,
        teacher_performance: teacherStats,
        class_performance: classStats,
      },
    });
  } catch (error) {
    console.error("Error fetching syllabus tracking statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching syllabus tracking statistics",
      error: error.message,
    });
  }
};
