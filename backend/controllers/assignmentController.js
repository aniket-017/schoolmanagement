const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subjectId,
      classId,
      dueDate,
      instructions,
      attachments,
      resources,
      totalMarks,
      weightage,
      allowLateSubmission,
      latePenalty,
      submissionFormat,
    } = req.body;

    // Verify teacher is authorized for this subject and class
    const teacher = await User.findById(req.user.id);
    if (teacher.role === "teacher" && !teacher.subjects.includes(subjectId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create assignments for this subject",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      classId,
      teacherId: req.user.id,
      dueDate,
      instructions,
      attachments,
      resources,
      totalMarks,
      weightage,
      allowLateSubmission,
      latePenalty,
      submissionFormat,
    });

    await assignment.populate([
      { path: "subjectId", select: "name code" },
      { path: "classId", select: "name grade section" },
      { path: "teacherId", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating assignment",
    });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAllAssignments = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, status, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;

    // If user is a teacher, only show their assignments
    if (req.user.role === "teacher") {
      filter.teacherId = req.user.id;
    }

    // If user is a student, only show assignments for their class
    if (req.user.role === "student") {
      const student = await User.findById(req.user.id);
      if (student.class) {
        filter.classId = student.class;
      }
    }

    const skip = (page - 1) * limit;

    const assignments = await Assignment.find(filter)
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email")
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAssignments = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      count: assignments.length,
      total: totalAssignments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalAssignments / limit),
      data: assignments,
    });
  } catch (error) {
    console.error("Get all assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assignments",
    });
  }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is authorized to view this assignment
    if (req.user.role === "teacher" && assignment.teacherId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // If user is a student, check if assignment is for their class
    if (req.user.role === "student") {
      const student = await User.findById(req.user.id);
      if (student.class && student.class.toString() !== assignment.classId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assignment",
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher/Admin)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is authorized to update this assignment
    if (req.user.role === "teacher" && assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("subjectId", "name code")
      .populate("classId", "name grade section")
      .populate("teacherId", "name email");

    res.json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating assignment",
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher/Admin)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is authorized to delete this assignment
    if (req.user.role === "teacher" && assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if there are any submissions
    const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id });
    if (submissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete assignment with existing submissions",
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting assignment",
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const { submission, attachments } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if student is in the correct class
    const student = await User.findById(req.user.id);
    if (!student.class || student.class.toString() !== assignment.classId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this class",
      });
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      assignmentId: req.params.id,
      studentId: req.user.id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "Assignment already submitted",
      });
    }

    // Check if late submission is allowed
    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: "Late submissions are not allowed for this assignment",
      });
    }

    const assignmentSubmission = await AssignmentSubmission.create({
      assignmentId: req.params.id,
      studentId: req.user.id,
      submission,
      attachments,
      isLate,
    });

    await assignmentSubmission.populate([
      { path: "assignmentId", select: "title totalMarks" },
      { path: "studentId", select: "name studentId" },
    ]);

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: assignmentSubmission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting assignment",
    });
  }
};

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher/Admin)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is authorized to view submissions
    if (req.user.role === "teacher" && assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id })
      .populate("studentId", "name studentId")
      .populate("gradedBy", "name")
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get assignment submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
    });
  }
};

// @desc    Grade assignment submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Private (Teacher/Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(req.params.id).populate("assignmentId");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if user is authorized to grade this submission
    if (req.user.role === "teacher" && submission.assignmentId.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    submission.status = "graded";

    await submission.save();

    await submission.populate([
      { path: "studentId", select: "name studentId" },
      { path: "gradedBy", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while grading submission",
    });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
};
