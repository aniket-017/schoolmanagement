const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");

// Get all teachers with their lecture information
exports.getAllTeachers = async (req, res) => {
  try {
    console.log("getAllTeachers called");
    console.log("Current user:", req.user);
    console.log("User role:", req.user?.role);
    
    const { status, isActive, page = 1, limit = 10 } = req.query;
    const query = { role: "teacher" };

    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const teachers = await User.find(query)
      .populate([
        { path: "subjects", select: "name code" },
        { path: "preferredSubjects", select: "name code" },
        { path: "lectureSchedule.classId", select: "grade division" },
        { path: "lectureSchedule.subjectId", select: "name code" },
      ])
      .select("-password")
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format teacher names properly
    const formattedTeachers = teachers.map(teacher => {
      const teacherObj = teacher.toObject();
      const nameParts = [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean);
      teacherObj.name = nameParts.length > 0 ? nameParts.join(" ") : teacher.name || teacher.email;
      teacherObj.fullName = teacherObj.name;
      return teacherObj;
    });

    const total = await User.countDocuments(query);

    console.log(`Found ${formattedTeachers.length} teachers`);

    res.json({
      success: true,
      data: formattedTeachers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};

// Get teacher by ID with detailed lecture information
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: "teacher" })
      .populate([
        { path: "subjects", select: "name code description" },
        { path: "preferredSubjects", select: "name code description" },
        { path: "lectureSchedule.classId", select: "grade division classroom" },
        { path: "lectureSchedule.subjectId", select: "name code description" },
      ])
      .select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Format teacher name properly
    const teacherObj = teacher.toObject();
    const nameParts = [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean);
    teacherObj.name = nameParts.length > 0 ? nameParts.join(" ") : teacher.name || teacher.email;
    teacherObj.fullName = teacherObj.name;

    // Get current timetable assignments
    const currentTimetable = await Timetable.find({
      "periods.teacher": id,
      isActive: true,
    }).populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name code" },
    ]);

    // Calculate workload statistics
    const workloadStats = calculateTeacherWorkload(teacher, currentTimetable);

    res.json({
      success: true,
      data: {
        teacher: teacherObj,
        currentTimetable,
        workloadStats,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher",
      error: error.message,
    });
  }
};

// Update teacher lecture schedule
exports.updateTeacherSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { lectureSchedule, availability, maxPeriodsPerDay } = req.body;

    const updateData = {};
    if (lectureSchedule) updateData.lectureSchedule = lectureSchedule;
    if (availability) updateData.availability = availability;
    if (maxPeriodsPerDay) updateData.maxPeriodsPerDay = maxPeriodsPerDay;

    // Recalculate total periods per week
    if (lectureSchedule) {
      updateData.totalPeriodsPerWeek = lectureSchedule.filter((lecture) => lecture.isActive).length;
    }

    const teacher = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate([
        { path: "subjects", select: "name code" },
        { path: "preferredSubjects", select: "name code" },
        { path: "lectureSchedule.classId", select: "grade division" },
        { path: "lectureSchedule.subjectId", select: "name code" },
      ])
      .select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      message: "Teacher schedule updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error updating teacher schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher schedule",
      error: error.message,
    });
  }
};

// Get teacher availability for specific time slot
exports.getTeacherAvailability = async (req, res) => {
  try {
    const { teacherId, day, startTime, endTime, excludeClassId } = req.query;

    if (!teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID, day, start time, and end time are required",
      });
    }

    // Get teacher information
    const teacher = await User.findById(teacherId).select("availability maxPeriodsPerDay lectureSchedule");
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Check if teacher is available on this day
    const dayAvailability = teacher.availability[day];
    if (!dayAvailability || !dayAvailability.available) {
      return res.json({
        success: true,
        data: {
          isAvailable: false,
          reason: "Teacher not available on this day",
        },
      });
    }

    // Check current timetable conflicts
    const conflicts = await Timetable.find({
      "periods.teacher": teacherId,
      day,
      isActive: true,
      "periods.startTime": { $lt: endTime },
      "periods.endTime": { $gt: startTime },
    }).populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name" },
    ]);

    // Check if teacher has reached max periods for the day
    const currentDayPeriods = await Timetable.aggregate([
      {
        $match: {
          "periods.teacher": teacher._id,
          day,
          isActive: true,
        },
      },
      {
        $unwind: "$periods",
      },
      {
        $match: {
          "periods.teacher": teacher._id,
        },
      },
      {
        $count: "totalPeriods",
      },
    ]);

    const currentPeriods = currentDayPeriods[0]?.totalPeriods || 0;
    const maxPeriods = dayAvailability.maxPeriods || teacher.maxPeriodsPerDay;

    const availability = {
      isAvailable: conflicts.length === 0 && currentPeriods < maxPeriods,
      conflicts: conflicts.map((timetable) => ({
        classId: timetable.classId._id,
        className: `${timetable.classId.grade}${timetable.classId.division}`,
        periods: timetable.periods.filter((period) => period.startTime < endTime && period.endTime > startTime),
      })),
      currentPeriods,
      maxPeriods,
      dayAvailability,
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

// Get all available teachers for a subject with detailed information
exports.getAvailableTeachersForSubject = async (req, res) => {
  try {
    console.log("getAvailableTeachersForSubject called with:", req.query);
    console.log("Current user:", req.user);

    const { subjectId, day, startTime, endTime, excludeClassId } = req.query;

    if (!subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Subject ID, day, start time, and end time are required",
      });
    }

    // Get all teachers who can teach this subject
    console.log("Searching for teachers with subjectId:", subjectId);

    // First check if the subject exists
    const subject = await Subject.findById(subjectId);
    console.log("Subject found:", subject ? subject.name : "Not found");

    const teachers = await User.find({
      role: "teacher",
      status: "approved",
      isActive: true,
      $or: [{ subjects: subjectId }, { preferredSubjects: subjectId }],
    })
      .populate([
        { path: "subjects", select: "name code" },
        { path: "preferredSubjects", select: "name code" },
      ])
      .select(
        "name firstName middleName lastName email phone availability maxPeriodsPerDay totalPeriodsPerWeek lectureSchedule"
      );

    console.log("Found teachers:", teachers.length);

    // Also check total teachers in database
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    console.log("Total teachers in database:", totalTeachers);

    // Check teachers by status
    const approvedTeachers = await User.countDocuments({ role: "teacher", status: "approved" });
    const activeTeachers = await User.countDocuments({ role: "teacher", isActive: true });
    console.log("Approved teachers:", approvedTeachers, "Active teachers:", activeTeachers);

    // Check availability for each teacher
    const availableTeachers = [];
    for (const teacher of teachers) {
      const availability = await checkTeacherDetailedAvailability(teacher._id, day, startTime, endTime, excludeClassId);

      // Create display name using new schema with fallback
      const displayName =
        teacher.firstName || teacher.lastName
          ? [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ")
          : teacher.name || "Unnamed Teacher";

      const teacherInfo = {
        ...teacher.toObject(),
        name: displayName,
        availability: availability.isAvailable ? "available" : "conflict",
        conflicts: availability.conflicts,
        currentPeriods: availability.currentPeriods,
        maxPeriods: availability.maxPeriods,
        dayAvailability: availability.dayAvailability,
      };

      availableTeachers.push(teacherInfo);
    }

    // Sort by availability and then by name
    availableTeachers.sort((a, b) => {
      if (a.availability === "available" && b.availability !== "available") return -1;
      if (a.availability !== "available" && b.availability === "available") return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      data: availableTeachers,
    });
  } catch (error) {
    console.error("Error getting available teachers for subject:", error);
    res.status(500).json({
      success: false,
      message: "Error getting available teachers for subject",
      error: error.message,
    });
  }
};

// Get teacher workload statistics
exports.getTeacherWorkload = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId).select(
      "lectureSchedule totalPeriodsPerWeek maxPeriodsPerDay availability"
    );
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Get current timetable assignments
    const currentTimetable = await Timetable.find({
      "periods.teacher": teacherId,
      isActive: true,
    }).populate([
      { path: "classId", select: "grade division" },
      { path: "periods.subject", select: "name code" },
    ]);

    const workloadStats = calculateTeacherWorkload(teacher, currentTimetable);

    res.json({
      success: true,
      data: workloadStats,
    });
  } catch (error) {
    console.error("Error fetching teacher workload:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher workload",
      error: error.message,
    });
  }
};

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

// Helper function to check teacher detailed availability
async function checkTeacherDetailedAvailability(teacherId, day, startTime, endTime, excludeClassId) {
  const teacher = await User.findById(teacherId).select("availability maxPeriodsPerDay");
  if (!teacher) {
    return { isAvailable: false, conflicts: [], currentPeriods: 0, maxPeriods: 8 };
  }

  const dayAvailability = teacher.availability[day];
  if (!dayAvailability || !dayAvailability.available) {
    return {
      isAvailable: false,
      conflicts: [],
      currentPeriods: 0,
      maxPeriods: dayAvailability?.maxPeriods || teacher.maxPeriodsPerDay,
      dayAvailability,
    };
  }

  // Teachers can be assigned to multiple classes/subjects at the same time
  // Only check if they exceed their maximum periods per day
  const currentDayPeriods = await Timetable.aggregate([
    {
      $match: {
        "periods.teacher": teacher._id,
        day,
        isActive: true,
      },
    },
    {
      $unwind: "$periods",
    },
    {
      $match: {
        "periods.teacher": teacher._id,
      },
    },
    {
      $count: "totalPeriods",
    },
  ]);

  const currentPeriods = currentDayPeriods[0]?.totalPeriods || 0;
  const maxPeriods = dayAvailability.maxPeriods || teacher.maxPeriodsPerDay;

  return {
    isAvailable: currentPeriods < maxPeriods,
    conflicts: [], // No conflicts since teachers can teach multiple classes
    currentPeriods,
    maxPeriods,
    dayAvailability,
  };
}

module.exports = exports;
