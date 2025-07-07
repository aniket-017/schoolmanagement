const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");

// Create a new timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number } = req.body;

    // Validate required fields
    if (!class_id || !subject_id || !teacher_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check for time conflicts for the same class
    const classConflict = await Timetable.findOne({
      class_id,
      day_of_week,
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
    });

    if (classConflict) {
      return res.status(400).json({
        success: false,
        message: "Time conflict: Class already has a subject scheduled at this time",
      });
    }

    // Check for teacher conflicts
    const teacherConflict = await Timetable.findOne({
      teacher_id,
      day_of_week,
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
    });

    if (teacherConflict) {
      return res.status(400).json({
        success: false,
        message: "Time conflict: Teacher is already scheduled at this time",
      });
    }

    // Check for room conflicts if room is specified
    if (room_number) {
      const roomConflict = await Timetable.findOne({
        room_number,
        day_of_week,
        $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
      });

      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: "Time conflict: Room is already occupied at this time",
        });
      }
    }

    const timetable = new Timetable({
      class_id,
      subject_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
    });

    await timetable.save();
    await timetable.populate(["class_id", "subject_id", "teacher_id"]);

    res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Error creating timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error creating timetable entry",
      error: error.message,
    });
  }
};

// Get all timetable entries with filters
exports.getTimetables = async (req, res) => {
  try {
    const { class_id, teacher_id, day_of_week, page = 1, limit = 10 } = req.query;
    const query = {};

    // Build query filters
    if (class_id) query.class_id = class_id;
    if (teacher_id) query.teacher_id = teacher_id;
    if (day_of_week) query.day_of_week = day_of_week;

    const skip = (page - 1) * limit;

    const timetables = await Timetable.find(query)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .populate("teacher_id", "name email")
      .sort({ day_of_week: 1, start_time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timetable.countDocuments(query);

    res.json({
      success: true,
      data: timetables,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching timetables:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching timetables",
      error: error.message,
    });
  }
};

// Get timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .populate("teacher_id", "name email");

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    res.json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching timetable entry",
      error: error.message,
    });
  }
};

// Get class timetable (organized by day)
exports.getClassTimetable = async (req, res) => {
  try {
    const { class_id } = req.params;

    const timetables = await Timetable.find({ class_id })
      .populate("subject_id", "name code")
      .populate("teacher_id", "name")
      .sort({ day_of_week: 1, start_time: 1 });

    // Group by day of week
    const weeklyTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    timetables.forEach((entry) => {
      weeklyTimetable[entry.day_of_week].push(entry);
    });

    res.json({
      success: true,
      data: weeklyTimetable,
    });
  } catch (error) {
    console.error("Error fetching class timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class timetable",
      error: error.message,
    });
  }
};

// Get teacher timetable
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { teacher_id } = req.params;

    const timetables = await Timetable.find({ teacher_id })
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .sort({ day_of_week: 1, start_time: 1 });

    // Group by day of week
    const weeklyTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    timetables.forEach((entry) => {
      weeklyTimetable[entry.day_of_week].push(entry);
    });

    res.json({
      success: true,
      data: weeklyTimetable,
    });
  } catch (error) {
    console.error("Error fetching teacher timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher timetable",
      error: error.message,
    });
  }
};

// Update timetable entry
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number } = req.body;

    // Check for conflicts if time-related fields are being updated
    if (day_of_week || start_time || end_time) {
      const updateData = { day_of_week, start_time, end_time };

      // Get current timetable data for comparison
      const currentTimetable = await Timetable.findById(id);
      if (!currentTimetable) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      const checkData = {
        class_id: class_id || currentTimetable.class_id,
        teacher_id: teacher_id || currentTimetable.teacher_id,
        day_of_week: day_of_week || currentTimetable.day_of_week,
        start_time: start_time || currentTimetable.start_time,
        end_time: end_time || currentTimetable.end_time,
        room_number: room_number || currentTimetable.room_number,
      };

      // Check for class conflicts
      const classConflict = await Timetable.findOne({
        _id: { $ne: id },
        class_id: checkData.class_id,
        day_of_week: checkData.day_of_week,
        $or: [{ start_time: { $lt: checkData.end_time }, end_time: { $gt: checkData.start_time } }],
      });

      if (classConflict) {
        return res.status(400).json({
          success: false,
          message: "Time conflict: Class already has a subject scheduled at this time",
        });
      }

      // Check for teacher conflicts
      const teacherConflict = await Timetable.findOne({
        _id: { $ne: id },
        teacher_id: checkData.teacher_id,
        day_of_week: checkData.day_of_week,
        $or: [{ start_time: { $lt: checkData.end_time }, end_time: { $gt: checkData.start_time } }],
      });

      if (teacherConflict) {
        return res.status(400).json({
          success: false,
          message: "Time conflict: Teacher is already scheduled at this time",
        });
      }

      // Check for room conflicts if room is specified
      if (checkData.room_number) {
        const roomConflict = await Timetable.findOne({
          _id: { $ne: id },
          room_number: checkData.room_number,
          day_of_week: checkData.day_of_week,
          $or: [{ start_time: { $lt: checkData.end_time }, end_time: { $gt: checkData.start_time } }],
        });

        if (roomConflict) {
          return res.status(400).json({
            success: false,
            message: "Time conflict: Room is already occupied at this time",
          });
        }
      }
    }

    const timetable = await Timetable.findByIdAndUpdate(
      id,
      { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number },
      { new: true, runValidators: true }
    ).populate(["class_id", "subject_id", "teacher_id"]);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    res.json({
      success: true,
      message: "Timetable entry updated successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error updating timetable entry",
      error: error.message,
    });
  }
};

// Delete timetable entry
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    res.json({
      success: true,
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting timetable entry",
      error: error.message,
    });
  }
};

// Get timetable statistics
exports.getTimetableStats = async (req, res) => {
  try {
    const totalEntries = await Timetable.countDocuments();
    const entriesByDay = await Timetable.aggregate([
      { $group: { _id: "$day_of_week", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const teacherWorkload = await Timetable.aggregate([
      { $group: { _id: "$teacher_id", periods: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "teacher" } },
      { $unwind: "$teacher" },
      { $project: { teacher_name: "$teacher.name", periods: 1 } },
      { $sort: { periods: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total_entries: totalEntries,
        entries_by_day: entriesByDay,
        teacher_workload: teacherWorkload,
      },
    });
  } catch (error) {
    console.error("Error fetching timetable statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching timetable statistics",
      error: error.message,
    });
  }
};
