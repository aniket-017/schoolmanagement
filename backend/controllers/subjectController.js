const Subject = require("../models/Subject");
const Class = require("../models/Class");
const User = require("../models/User");

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getAllSubjects = async (req, res) => {
  try {
    const { department, isActive } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const subjects = await Subject.find(filter).sort({ department: 1, name: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
    });
  }
};

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Get subject error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subject",
    });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin only)
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      department,
      credits,
      syllabus,
      textbooks,
      references,
      totalMarks,
      passingMarks,
      assessmentPattern,
    } = req.body;

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      department,
      credits,
      syllabus,
      textbooks,
      references,
      totalMarks,
      passingMarks,
      assessmentPattern,
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subject code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating subject",
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subject code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating subject",
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check if subject is assigned to any classes
    const classesWithSubject = await Class.find({
      "subjects.subject": req.params.id,
    });

    if (classesWithSubject.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subject. It is assigned to one or more classes.",
      });
    }

    // Check if subject is assigned to any teachers
    const teachersWithSubject = await User.find({
      subjects: req.params.id,
    });

    if (teachersWithSubject.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subject. It is assigned to one or more teachers.",
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subject",
    });
  }
};

// @desc    Get subjects by department
// @route   GET /api/subjects/department/:department
// @access  Private
const getSubjectsByDepartment = async (req, res) => {
  try {
    const subjects = await Subject.find({
      department: req.params.department,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error("Get subjects by department error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subjects by department",
    });
  }
};

// @desc    Assign subject to teacher
// @route   PUT /api/subjects/:id/assign-teacher
// @access  Private (Admin only)
const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Add subject to teacher's subjects array if not already present
    if (!teacher.subjects.includes(req.params.id)) {
      teacher.subjects.push(req.params.id);
      await teacher.save();
    }

    res.json({
      success: true,
      message: "Subject assigned to teacher successfully",
    });
  } catch (error) {
    console.error("Assign subject to teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while assigning subject to teacher",
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartment,
  assignSubjectToTeacher,
};
