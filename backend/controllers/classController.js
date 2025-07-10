const Class = require("../models/Class");
const User = require("../models/User");

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin/Teacher)
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate("classTeacher", "name email")
      .populate("students", "name studentId")
      .populate("subjects.subject", "name code")
      .populate("subjects.teacher", "name email")
      .sort({ grade: 1, division: 1 });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching classes",
      error: error.message,
    });
  }
};

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private (Admin/Teacher)
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate("classTeacher", "name email phone")
      .populate("students", "name studentId email phone")
      .populate("subjects.subject", "name code")
      .populate("subjects.teacher", "name email");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class",
      error: error.message,
    });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
const createClass = async (req, res) => {
  try {
    const { grade, division, academicYear, maxStudents, classroom } = req.body;

    // Check if class-division combination already exists
    const existingClass = await Class.findOne({
      grade,
      division,
      academicYear,
      isActive: true,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: `Class ${grade}${getOrdinalSuffix(grade)} - ${division} already exists for this academic year`,
      });
    }

    // Create class name
    const name = `${grade}${getOrdinalSuffix(grade)} Class`;

    const newClass = new Class({
      name,
      grade,
      division,
      academicYear,
      maxStudents: maxStudents || 40,
      classroom,
      currentStrength: 0,
    });

    await newClass.save();

    const populatedClass = await Class.findById(newClass._id)
      .populate("classTeacher", "name email")
      .populate("students", "name studentId");

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: populatedClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
const updateClass = async (req, res) => {
  try {
    const { classTeacher, maxStudents, classroom, isActive } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        classTeacher,
        maxStudents,
        classroom,
        isActive,
      },
      { new: true, runValidators: true }
    )
      .populate("classTeacher", "name email")
      .populate("students", "name studentId");

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Error updating class",
      error: error.message,
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if class has students
    if (classData.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete class with enrolled students",
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting class",
      error: error.message,
    });
  }
};

// @desc    Assign class teacher
// @route   PUT /api/classes/:id/assign-teacher
// @access  Private (Admin only)
const assignClassTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;

    // Verify teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { classTeacher: teacherId },
      { new: true, runValidators: true }
    )
      .populate("classTeacher", "name email")
      .populate("students", "name studentId");

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      message: "Class teacher assigned successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error assigning class teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning class teacher",
      error: error.message,
    });
  }
};

// @desc    Get available teachers for assignment
// @route   GET /api/classes/available-teachers
// @access  Private (Admin only)
const getAvailableTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      isActive: true,
      status: "approved",
    }).select("name email employeeId");

    res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching available teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available teachers",
      error: error.message,
    });
  }
};

// Helper function for ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignClassTeacher,
  getAvailableTeachers,
};
