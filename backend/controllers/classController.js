const Class = require("../models/Class");
const User = require("../models/User");
const Student = require("../models/Student");

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin/Teacher)
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate("classTeacher", "name firstName middleName lastName email")
      .populate("students", "name studentId")
      .populate("subjects.subject", "name code")
      .populate("subjects.teacher", "name firstName middleName lastName email")
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
      .populate("classTeacher", "name firstName middleName lastName email phone")
      .populate("students", "name studentId email phone")
      .populate("subjects.subject", "name code")
      .populate("subjects.teacher", "name firstName middleName lastName email");

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
      maxStudents: maxStudents || 70,
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
    const classData = await Class.findById(req.params.id).populate("students");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get all student IDs in the class
    const studentIds = classData.students.map((student) => student._id);

    if (studentIds.length > 0) {
      console.log(`Implementing cascading delete for class ${classData.name} with ${studentIds.length} students`);

      // Import required models
      const Attendance = require("../models/Attendance");
      const Grade = require("../models/Grade");
      const Fee = require("../models/Fee");
      const StudentTransport = require("../models/StudentTransport");
      const AssignmentSubmission = require("../models/AssignmentSubmission");
      const LibraryTransaction = require("../models/LibraryTransaction");
      const Communication = require("../models/Communication");

      // Delete related data for all students in the class
      console.log("Cleaning up attendance records...");
      await Attendance.deleteMany({ studentId: { $in: studentIds } });

      console.log("Cleaning up grade records...");
      await Grade.deleteMany({ studentId: { $in: studentIds } });

      console.log("Cleaning up fee records...");
      await Fee.deleteMany({ studentId: { $in: studentIds } });

      console.log("Cleaning up student transport records...");
      await StudentTransport.deleteMany({ studentId: { $in: studentIds } });

      console.log("Cleaning up assignment submission records...");
      await AssignmentSubmission.deleteMany({ studentId: { $in: studentIds } });

      console.log("Cleaning up library transaction records...");
      await LibraryTransaction.deleteMany({ userId: { $in: studentIds } });

      console.log("Cleaning up communication records...");
      await Communication.deleteMany({
        $or: [{ senderId: { $in: studentIds } }, { receiverId: { $in: studentIds } }],
      });

      // Delete all students in the class
      console.log("Deleting student records...");
      await Student.deleteMany({ _id: { $in: studentIds } });
    }

    // Delete the class itself
    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Class deleted successfully along with ${studentIds.length} students and all related data`,
      deletedStudents: studentIds.length,
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
      .populate("classTeacher", "name firstName middleName lastName email")
      .populate("students", "name studentId");

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Prepare response message
    const teacherDisplayName =
      teacher.firstName || teacher.lastName
        ? [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ")
        : teacher.name || "Teacher";

    let message = `Teacher ${teacherDisplayName} assigned to ${updatedClass.grade}${getOrdinalSuffix(
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
    // Get all teachers with updated name fields
    const teachers = await User.find({ role: "teacher" })
      .populate("subjects", "name")
      .select("name firstName middleName lastName email subjects experience");

    // Get current class assignments for each teacher
    const teachersWithAssignments = await Promise.all(
      teachers.map(async (teacher) => {
        const currentAssignments = await Class.find({
          classTeacher: teacher._id,
          isActive: true,
        }).select("name grade division");

        // Create display name using new schema with fallback
        const displayName =
          teacher.firstName || teacher.lastName
            ? [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ")
            : teacher.name || "Unnamed Teacher";

        return {
          _id: teacher._id,
          name: displayName,
          firstName: teacher.firstName,
          middleName: teacher.middleName,
          lastName: teacher.lastName,
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

// @desc    Get classes assigned to a specific teacher
// @route   GET /api/classes/teacher/assigned
// @access  Private (Teacher only)
const getTeacherAssignedClasses = async (req, res) => {
  try {
    // Get classes where the current teacher is assigned as class teacher
    const assignedClasses = await Class.find({
      classTeacher: req.user.id,
      isActive: true,
    })
      .populate("students", "name studentId email")
      .populate("subjects.subject", "name code")
      .populate("subjects.teacher", "name email")
      .sort({ grade: 1, division: 1 });

    // Get additional information for each class
    const classesWithDetails = await Promise.all(
      assignedClasses.map(async (classItem) => {
        // Get student count
        const studentCount = classItem.students ? classItem.students.length : 0;

        // Get subjects count
        const subjectsCount = classItem.subjects ? classItem.subjects.length : 0;

        // Get recent assignments count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const Assignment = require("../models/Assignment");
        const recentAssignments = await Assignment.countDocuments({
          classId: classItem._id,
          assignedDate: { $gte: thirtyDaysAgo },
          isActive: true,
        });

        return {
          ...classItem.toObject(),
          studentCount,
          subjectsCount,
          recentAssignments,
        };
      })
    );

    res.json({
      success: true,
      data: classesWithDetails,
      summary: {
        totalClasses: classesWithDetails.length,
        totalStudents: classesWithDetails.reduce((sum, cls) => sum + cls.studentCount, 0),
        totalSubjects: classesWithDetails.reduce((sum, cls) => sum + cls.subjectsCount, 0),
        totalRecentAssignments: classesWithDetails.reduce((sum, cls) => sum + cls.recentAssignments, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher assigned classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned classes",
      error: error.message,
    });
  }
};

// @desc    Get classes from teacher's timetable
// @route   GET /api/classes/teacher/timetable
// @access  Private (Teacher only)
const getTeacherTimetableClasses = async (req, res) => {
  try {
    const Timetable = require("../models/Timetable");
    
    // Find all timetables where the current teacher is assigned to any period
    const timetables = await Timetable.find({
      "periods.teacher": req.user._id
    }).populate("classId", "name grade division");

    // Extract unique class IDs from the timetables
    const classIds = [...new Set(timetables.map(t => t.classId._id.toString()))];
    
    // Get detailed class information for each unique class
    const classesWithDetails = await Promise.all(
      classIds.map(async (classId) => {
        const classData = await Class.findById(classId)
          .populate("students", "name studentId email")
          .populate("subjects.subject", "name code")
          .populate("subjects.teacher", "name email");

        if (!classData) return null;

        // Get student count
        const studentCount = classData.students ? classData.students.length : 0;

        // Get subjects count
        const subjectsCount = classData.subjects ? classData.subjects.length : 0;

        // Get recent assignments count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const Assignment = require("../models/Assignment");
        const recentAssignments = await Assignment.countDocuments({
          classId: classData._id,
          assignedDate: { $gte: thirtyDaysAgo },
          isActive: true,
        });

        return {
          ...classData.toObject(),
          studentCount,
          subjectsCount,
          recentAssignments,
        };
      })
    );

    // Filter out null values and return
    const validClasses = classesWithDetails.filter(cls => cls !== null);

    res.json({
      success: true,
      data: validClasses,
      summary: {
        totalClasses: validClasses.length,
        totalStudents: validClasses.reduce((sum, cls) => sum + cls.studentCount, 0),
        totalSubjects: validClasses.reduce((sum, cls) => sum + cls.subjectsCount, 0),
        totalRecentAssignments: validClasses.reduce((sum, cls) => sum + cls.recentAssignments, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher timetable classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching timetable classes",
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
  getTeacherAssignedClasses,
  getTeacherTimetableClasses,
};
