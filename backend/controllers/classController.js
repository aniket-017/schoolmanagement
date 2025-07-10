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

    // Get current class to assign
    const classToAssign = await Class.findById(req.params.id);
    if (!classToAssign) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if teacher is already assigned to this class
    if (classToAssign.classTeacher && classToAssign.classTeacher.toString() === teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher is already assigned to this class",
      });
    }

    // Get all classes where this teacher is currently assigned
    const currentAssignments = await Class.find({
      classTeacher: teacherId,
      isActive: true,
    }).select("name grade division");

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

    // Prepare response message
    let message = `Teacher ${teacher.name} assigned to ${updatedClass.grade}${getOrdinalSuffix(
      updatedClass.grade
    )} Class - ${updatedClass.division}`;

    if (currentAssignments.length > 0) {
      const assignmentList = currentAssignments
        .map((cls) => `${cls.grade}${getOrdinalSuffix(cls.grade)} Class - ${cls.division}`)
        .join(", ");
      message += `. Teacher is also assigned to: ${assignmentList}`;
    }

    res.json({
      success: true,
      message: message,
      data: updatedClass,
      currentAssignments: currentAssignments,
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

// @desc    Get available teachers for class assignment
// @route   GET /api/classes/available-teachers
// @access  Private (Admin only)
const getAvailableTeachers = async (req, res) => {
  try {
    // Get all teachers
    const teachers = await User.find({ role: "teacher" })
      .populate("subjects", "name")
      .select("name email subjects experience");

    // Get current class assignments for each teacher
    const teachersWithAssignments = await Promise.all(
      teachers.map(async (teacher) => {
        const currentAssignments = await Class.find({
          classTeacher: teacher._id,
          isActive: true,
        }).select("name grade division");

        return {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          subjects: teacher.subjects,
          experience: teacher.experience,
          isClassTeacher: currentAssignments.length > 0,
          currentClassAssignment:
            currentAssignments.length > 0
              ? {
                  className: currentAssignments
                    .map((cls) => `${cls.grade}${getOrdinalSuffix(cls.grade)} Class - ${cls.division}`)
                    .join(", "),
                  assignments: currentAssignments,
                }
              : null,
          totalAssignments: currentAssignments.length,
        };
      })
    );

    res.json({
      success: true,
      data: teachersWithAssignments,
    });
  } catch (error) {
    console.error("Error getting available teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error getting available teachers",
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
