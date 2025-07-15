const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");

// Create a new timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { classId, day, periods, academicYear, semester } = req.body;

    // Validate required fields
    if (!classId || !day || !periods || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Class ID, day, periods, and academic year are required",
      });
    }

    // Check if timetable already exists for this class and day
    const existingTimetable = await Timetable.findOne({
      classId,
      day,
      academicYear,
      isActive: true,
    });

    if (existingTimetable) {
      return res.status(400).json({
        success: false,
        message: "Timetable already exists for this class and day",
      });
    }

    // Validate periods and check for conflicts
    const conflicts = await checkTimetableConflicts(classId, day, periods, academicYear);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Timetable conflicts detected",
        conflicts,
      });
    }

    const timetable = new Timetable({
      classId,
      day,
      periods,
      academicYear,
      semester,
    });

    await timetable.save();
    await timetable.populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name code" },
      { path: "periods.teacher", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Error creating timetable:", error);
    res.status(500).json({
      success: false,
      message: "Error creating timetable",
      error: error.message,
    });
  }
};

// Get all timetable entries with filters
exports.getTimetables = async (req, res) => {
  try {
    const { classId, teacherId, day, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    // Build query filters
    if (classId) query.classId = classId;
    if (teacherId) query["periods.teacher"] = teacherId;
    if (day) query.day = day;

    const skip = (page - 1) * limit;

    const timetables = await Timetable.find(query)
      .populate([
        { path: "classId", select: "grade division classroom" },
        { path: "periods.subject", select: "name code description" },
        { path: "periods.teacher", select: "name email phone" },
      ])
      .sort({ day: 1, "periods.periodNumber": 1 })
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
    const timetable = await Timetable.findById(req.params.id).populate([
      { path: "classId", select: "grade division classroom" },
      { path: "periods.subject", select: "name code description" },
      { path: "periods.teacher", select: "name email phone" },
    ]);

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

// Get complete timetable for a class
exports.getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const query = { classId, isActive: true };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const timetables = await Timetable.find(query)
      .populate([
        { path: "classId", select: "grade division classroom" },
        { path: "periods.subject", select: "name code description" },
        { path: "periods.teacher", select: "name email phone" },
      ])
      .sort({ day: 1, "periods.periodNumber": 1 });

    // Group by day
    const weeklyTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    timetables.forEach((timetable) => {
      if (weeklyTimetable[timetable.day]) {
        weeklyTimetable[timetable.day] = timetable.periods;
      }
    });

    res.json({
      success: true,
      data: {
        classId,
        academicYear: academicYear || new Date().getFullYear().toString(),
        weeklyTimetable,
      },
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

// Create or update class timetable (bulk operation)
exports.createOrUpdateClassTimetable = async (req, res) => {
  try {
    console.log("=== TIMETABLE SAVE REQUEST START ===");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.originalUrl);
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request params:", req.params);

    const { classId } = req.params;
    const { weeklyTimetable, academicYear, semester } = req.body;

    console.log("Received timetable save request:", {
      classId,
      academicYear,
      semester,
      weeklyTimetableKeys: Object.keys(weeklyTimetable),
      totalPeriods: Object.values(weeklyTimetable).reduce((sum, periods) => sum + (periods?.length || 0), 0),
    });

    if (!classId || !weeklyTimetable || !academicYear) {
      console.log("Validation failed:", { classId, hasWeeklyTimetable: !!weeklyTimetable, academicYear });
      return res.status(400).json({
        success: false,
        message: "Class ID, weekly timetable, and academic year are required",
      });
    }

    // Validate the class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Delete existing timetables for this class and academic year FIRST
    console.log("Deleting existing timetables for class:", classId, "academic year:", academicYear);
    const deleteResult = await Timetable.deleteMany({ classId, academicYear });
    console.log("Deleted", deleteResult.deletedCount, "existing timetables");

    // Check for conflicts across all days (after deleting existing entries)
    const allConflicts = [];
    for (const [day, periods] of Object.entries(weeklyTimetable)) {
      if (periods && periods.length > 0) {
        console.log(`Checking conflicts for ${day}:`, periods.length, "periods");
        const conflicts = await checkTimetableConflicts(classId, day, periods, academicYear);
        if (conflicts.length > 0) {
          console.log(`Conflicts found for ${day}:`, conflicts);
        }
        allConflicts.push(...conflicts.map((conflict) => ({ ...conflict, day })));
      }
    }

    if (allConflicts.length > 0) {
      console.log("Conflicts detected:", allConflicts);
      return res.status(400).json({
        success: false,
        message: "Timetable conflicts detected",
        conflicts: allConflicts,
      });
    } else {
      console.log("No conflicts detected - proceeding with save");
    }

    // Create new timetables
    const createdTimetables = [];
    for (const [day, periods] of Object.entries(weeklyTimetable)) {
      if (periods && periods.length > 0) {
        console.log(`Creating timetable for ${day}:`, periods.length, "periods");
        const timetable = new Timetable({
          classId,
          day,
          periods,
          academicYear,
          semester,
        });
        await timetable.save();
        createdTimetables.push(timetable);
      }
    }

    // Populate the created timetables
    await Timetable.populate(createdTimetables, [
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name code" },
      { path: "periods.teacher", select: "name email" },
    ]);

    console.log("Successfully created/updated timetable. Total created:", createdTimetables.length);
    console.log("=== TIMETABLE SAVE REQUEST END ===");
    res.json({
      success: true,
      message: "Class timetable created/updated successfully",
      data: {
        classId,
        academicYear,
        createdTimetables,
      },
    });
  } catch (error) {
    console.error("Error creating/updating class timetable:", error);
    console.log("=== TIMETABLE SAVE REQUEST ERROR ===");
    res.status(500).json({
      success: false,
      message: "Error creating/updating class timetable",
      error: error.message,
    });
  }
};

// Get teacher availability for a specific time slot
exports.getTeacherAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime, teacherId, excludeClassId } = req.query;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, start time, and end time are required",
      });
    }

    const query = {
      day,
      "periods.startTime": { $lt: endTime },
      "periods.endTime": { $gt: startTime },
      isActive: true,
    };

    if (teacherId) {
      query["periods.teacher"] = teacherId;
    }

    if (excludeClassId) {
      query.classId = { $ne: excludeClassId };
    }

    const conflicts = await Timetable.find(query).populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name" },
      { path: "periods.teacher", select: "name" },
    ]);

    const availability = {
      isAvailable: conflicts.length === 0,
      conflicts: conflicts.map((timetable) => ({
        classId: timetable.classId._id,
        className: `${timetable.classId.grade}${timetable.classId.division}`,
        periods: timetable.periods.filter((period) => period.startTime < endTime && period.endTime > startTime),
      })),
    };

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error checking teacher availability:", error);
    res.status(500).json({
      success: false,
      message: "Error checking teacher availability",
      error: error.message,
    });
  }
};

// Get teacher timetable
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log("getTeacherTimetable called for teacherId:", teacherId);

    const timetables = await Timetable.find({ "periods.teacher": teacherId, isActive: true })
      .populate([
        { path: "classId", select: "grade division classroom" },
        { path: "periods.subject", select: "name code description" },
        { path: "periods.teacher", select: "name email phone" },
      ])
      .sort({ day: 1, "periods.periodNumber": 1 });

    console.log("Found timetables for teacher:", timetables.length);
    console.log("Timetables data:", JSON.stringify(timetables, null, 2));

    // Group by day
    const weeklyTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    timetables.forEach((timetable) => {
      console.log("Processing timetable for day:", timetable.day);
      if (weeklyTimetable[timetable.day]) {
        // Filter periods for this specific teacher and add class information
        const teacherPeriods = timetable.periods
          .filter((period) => period.teacher && period.teacher._id.toString() === teacherId)
          .map((period) => ({
            ...period.toObject(),
            classId: timetable.classId, // Add class information to each period
          }));
        console.log("Teacher periods for", timetable.day, ":", teacherPeriods.length);
        weeklyTimetable[timetable.day].push(...teacherPeriods);
      }
    });

    console.log("Final weeklyTimetable:", JSON.stringify(weeklyTimetable, null, 2));

    res.json({
      success: true,
      data: {
        teacherId,
        weeklyTimetable,
      },
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
    const { classId, day, periods, academicYear, semester } = req.body;

    // Get current timetable data for comparison
    const currentTimetable = await Timetable.findById(id);
    if (!currentTimetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    // Check for conflicts if periods are being updated
    if (periods && periods.length > 0) {
      const conflicts = await checkTimetableConflicts(
        classId || currentTimetable.classId,
        day || currentTimetable.day,
        periods,
        academicYear || currentTimetable.academicYear
      );

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Timetable conflicts detected",
          conflicts,
        });
      }
    }

    const updateData = {};
    if (classId) updateData.classId = classId;
    if (day) updateData.day = day;
    if (periods) updateData.periods = periods;
    if (academicYear) updateData.academicYear = academicYear;
    if (semester) updateData.semester = semester;

    const timetable = await Timetable.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name code" },
      { path: "periods.teacher", select: "name email" },
    ]);

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
    const totalEntries = await Timetable.countDocuments({ isActive: true });
    const entriesByDay = await Timetable.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$day", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const teacherWorkload = await Timetable.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$periods" },
      { $group: { _id: "$periods.teacher", periods: { $sum: 1 } } },
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

// Helper function to check timetable conflicts
async function checkTimetableConflicts(classId, day, periods, academicYear) {
  const conflicts = [];

  for (const period of periods) {
    // Check for teacher conflicts (same teacher, same time, different class)
    if (period.teacher) {
      const teacherConflict = await Timetable.findOne({
        "periods.teacher": period.teacher,
        day,
        academicYear,
        isActive: true,
        classId: { $ne: classId },
        "periods.startTime": { $lt: period.endTime },
        "periods.endTime": { $gt: period.startTime },
      });

      if (teacherConflict) {
        conflicts.push({
          type: "teacher_conflict",
          period: period.periodNumber,
          teacher: period.teacher,
          message: "Teacher is already scheduled at this time",
        });
      }
    }

    // Check for room conflicts (same room, same time, different class)
    if (period.room) {
      const roomConflict = await Timetable.findOne({
        day,
        academicYear,
        isActive: true,
        classId: { $ne: classId },
        "periods.room": period.room,
        "periods.startTime": { $lt: period.endTime },
        "periods.endTime": { $gt: period.startTime },
      });

      if (roomConflict) {
        conflicts.push({
          type: "room_conflict",
          period: period.periodNumber,
          room: period.room,
          message: "Room is already occupied at this time",
        });
      }
    }
  }

  return conflicts;
}

// Helper function to check teacher availability
async function checkTeacherAvailability(teacherId, day, startTime, endTime, excludeClassId) {
  const query = {
    "periods.teacher": teacherId,
    day,
    isActive: true,
    "periods.startTime": { $lt: endTime },
    "periods.endTime": { $gt: startTime },
  };

  if (excludeClassId) {
    query.classId = { $ne: excludeClassId };
  }

  const conflicts = await Timetable.find(query).populate([
    { path: "classId", select: "grade division" },
    { path: "periods.subject", select: "name" },
  ]);

  return {
    isAvailable: conflicts.length === 0,
    conflicts: conflicts.map((timetable) => ({
      classId: timetable.classId._id,
      className: `${timetable.classId.grade}${timetable.classId.division}`,
      periods: timetable.periods.filter((period) => period.startTime < endTime && period.endTime > startTime),
    })),
  };
}

// Helper function to calculate teacher workload
function calculateTeacherWorkload(teacher, currentTimetable) {
  const workloadByDay = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  const classesTaught = new Set();
  const subjectsTaught = new Set();

  currentTimetable.forEach((timetable) => {
    timetable.periods.forEach((period) => {
      if (period.teacher && period.teacher.toString() === teacher._id.toString()) {
        workloadByDay[timetable.day]++;
        if (period.subject) subjectsTaught.add(period.subject._id.toString());
        if (timetable.classId) classesTaught.add(timetable.classId._id.toString());
      }
    });
  });

  const totalCurrentPeriods = Object.values(workloadByDay).reduce((sum, count) => sum + count, 0);

  return {
    totalCurrentPeriods,
    totalScheduledPeriods: teacher.totalPeriodsPerWeek || 0,
    maxPeriodsPerDay: teacher.maxPeriodsPerDay || 8,
    workloadByDay,
    classesTaught: Array.from(classesTaught),
    subjectsTaught: Array.from(subjectsTaught),
    availability: teacher.availability,
    utilizationPercentage: teacher.maxPeriodsPerDay
      ? Math.round((totalCurrentPeriods / (teacher.maxPeriodsPerDay * 6)) * 100)
      : 0,
  };
}
