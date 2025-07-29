const Homework = require("../models/Homework");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// @desc    Create homework
// @route   POST /api/homework
// @access  Private (Teacher/Admin)
const createHomework = async (req, res) => {
  try {
    const {
      title,
      description,
      subjectId,
      classId,
      dueDate,
      instructions,
      resources,
      color,
    } = req.body;

    // Verify teacher is authorized for this subject and class
    const teacher = await User.findById(req.user._id);
    if (teacher.role === "teacher" && !teacher.subjects.includes(subjectId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create homework for this subject",
      });
    }

    const homework = await Homework.create({
      title,
      description,
      subjectId,
      classId,
      teacherId: req.user._id,
      dueDate,
      instructions,
      resources,
      color,
    });

    await homework.populate([
      { path: "subjectId", select: "name code" },
      { path: "classId", select: "name grade section" },
      { path: "teacherId", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Homework created successfully",
      data: homework,
    });
  } catch (error) {
    console.error("Create homework error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating homework",
    });
  }
};

// @desc    Get all homework
// @route   GET /api/homework
// @access  Private
const getAllHomework = async (req, res) => {
  try {
    
    const { classId, subjectId, teacherId, status, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;

    // If user is a teacher, only show their homework
    if (req.user.role === "teacher") {
      filter.teacherId = req.user._id;
    }

    // If user is a student, only show homework for their class
    if (req.user.role === "student") {
      let student;
      if (req.user.constructor.modelName === 'Student') {
        student = req.user;
      } else {
        const Student = require("../models/Student");
        student = await Student.findById(req.user._id);
        if (!student) {
          student = await User.findById(req.user._id);
        }
      }
      
      if (student && student.class) {
        filter.classId = student.class;
      }
    }

    const skip = (page - 1) * limit;

    const homework = await Homework.find(filter)
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalHomework = await Homework.countDocuments(filter);

    res.json({
      success: true,
      count: homework.length,
      total: totalHomework,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalHomework / limit),
      data: homework,
    });
  } catch (error) {
    console.error("Get all homework error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching homework",
    });
  }
};

// @desc    Get homework by ID
// @route   GET /api/homework/:id
// @access  Private
const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email")
      .populate("studentProgress.studentId", "name studentId");

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    // Check if user is authorized to view this homework
    if (req.user.role === "teacher" && homework.teacherId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // If user is a student, check if homework is for their class
    if (req.user.role === "student") {
      let student;
      if (req.user.constructor.modelName === 'Student') {
        student = req.user;
      } else {
        const Student = require("../models/Student");
        student = await Student.findById(req.user._id);
        if (!student) {
          student = await User.findById(req.user._id);
        }
      }
      
      if (student && student.class && student.class.toString() !== homework.classId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      data: homework,
    });
  } catch (error) {
    console.error("Get homework by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching homework",
    });
  }
};

// @desc    Update homework
// @route   PUT /api/homework/:id
// @access  Private (Teacher/Admin)
const updateHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    // Check if user is authorized to update this homework
    if (req.user.role === "teacher" && homework.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedHomework = await Homework.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email");

    res.json({
      success: true,
      message: "Homework updated successfully",
      data: updatedHomework,
    });
  } catch (error) {
    console.error("Update homework error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating homework",
    });
  }
};

// @desc    Delete homework
// @route   DELETE /api/homework/:id
// @access  Private (Teacher/Admin)
const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    // Check if user is authorized to delete this homework
    if (req.user.role === "teacher" && homework.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await Homework.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Homework deleted successfully",
    });
  } catch (error) {
    console.error("Delete homework error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting homework",
    });
  }
};

// @desc    Update student progress
// @route   PUT /api/homework/:id/progress
// @access  Private (Student)
const updateStudentProgress = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    // Check if student is in the correct class
    let student;
    if (req.user.constructor.modelName === 'Student') {
      student = req.user;
    } else {
      const Student = require("../models/Student");
      student = await Student.findById(req.user._id);
      if (!student) {
        student = await User.findById(req.user._id);
      }
    }
    
    if (!student || !student.class || student.class.toString() !== homework.classId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this class",
      });
    }

    // Find existing progress or create new one
    let progressIndex = homework.studentProgress.findIndex(
      (p) => p.studentId.toString() === req.user._id.toString()
    );

    if (progressIndex === -1) {
      // Create new progress entry
      homework.studentProgress.push({
        studentId: req.user._id,
        status,
        notes,
        completedAt: status === "completed" ? new Date() : null,
      });
    } else {
      // Update existing progress
      homework.studentProgress[progressIndex].status = status;
      homework.studentProgress[progressIndex].notes = notes;
      homework.studentProgress[progressIndex].completedAt = status === "completed" ? new Date() : null;
    }

    await homework.save();
    await homework.populate([
      { path: "subjectId", select: "name code" },
      { path: "classId", select: "name grade section" },
      { path: "teacherId", select: "name email" },
      { path: "studentProgress.studentId", select: "name studentId" },
    ]);

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: homework,
    });
  } catch (error) {
    console.error("Update student progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// @desc    Get homework calendar data
// @route   GET /api/homework/calendar
// @access  Private
const getHomeworkCalendar = async (req, res) => {
  try {
    const { startDate, endDate, classId, subjectId } = req.query;

    let filter = { isActive: true };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;

    // If user is a teacher, only show their homework
    if (req.user.role === "teacher") {
      filter.teacherId = req.user._id;
    }

    // If user is a student, only show homework for their class
    if (req.user.role === "student") {
      let student;
      if (req.user.constructor.modelName === 'Student') {
        student = req.user;
      } else {
        const Student = require("../models/Student");
        student = await Student.findById(req.user._id);
        if (!student) {
          student = await User.findById(req.user._id);
        }
      }
      
      if (student && student.class) {
        filter.classId = student.class;
      }
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const homework = await Homework.find(filter)
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email")
      .sort({ dueDate: 1 });

    // Group homework by date for calendar view
    const calendarData = {};
    homework.forEach((hw) => {
      const dateKey = hw.dueDate.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(hw);
    });

    res.json({
      success: true,
      count: homework.length,
      data: calendarData,
    });
  } catch (error) {
    console.error("Get homework calendar error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching calendar data",
    });
  }
};

// @desc    Get homework statistics
// @route   GET /api/homework/stats
// @access  Private
const getHomeworkStats = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    let filter = { isActive: true };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;

    // If user is a teacher, only show their homework
    if (req.user.role === "teacher") {
      filter.teacherId = req.user._id;
    }

    // If user is a student, only show homework for their class
    if (req.user.role === "student") {
      let student;
      if (req.user.constructor.modelName === 'Student') {
        student = req.user;
      } else {
        const Student = require("../models/Student");
        student = await Student.findById(req.user._id);
        if (!student) {
          student = await User.findById(req.user._id);
        }
      }
      
      if (student && student.class) {
        filter.classId = student.class;
      }
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const stats = await Homework.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          overdue: {
            $sum: {
              $cond: [{ $lt: ["$dueDate", now] }, 1, 0],
            },
          },
          dueToday: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$dueDate", now] },
                    { $lt: ["$dueDate", tomorrow] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          dueTomorrow: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$dueDate", tomorrow] },
                    { $lt: ["$dueDate", new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          dueThisWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$dueDate", tomorrow] },
                    { $lte: ["$dueDate", nextWeek] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      overdue: 0,
      dueToday: 0,
      dueTomorrow: 0,
      dueThisWeek: 0,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get homework stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
    });
  }
};

module.exports = {
  createHomework,
  getAllHomework,
  getHomeworkById,
  updateHomework,
  deleteHomework,
  updateStudentProgress,
  getHomeworkCalendar,
  getHomeworkStats,
}; 