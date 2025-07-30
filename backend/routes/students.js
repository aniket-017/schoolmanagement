const express = require("express");
const router = express.Router();
const { auth, adminOnly, teacherOrAdmin } = require("../middleware/auth");

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin/Teacher)
router.get("/", auth, teacherOrAdmin, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const students = await Student.find({ isActive: true })
      .populate("class", "name grade division")
      .populate("feeSlabId", "slabName totalAmount installments")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Admin/Teacher)
router.get("/:id", auth, teacherOrAdmin, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const student = await Student.findById(req.params.id)
      .populate("class", "name grade division")
      .populate("feeSlabId", "slabName totalAmount installments")
      .populate("transportRoute", "routeName vehicleNumber");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const {
      firstName,
      middleName,
      lastName,
      email,
      mobileNumber,
      dateOfBirth,
      gender,
      currentAddress,
      mothersName,
      parentsMobileNumber,
      rollNumber,
      bloodGroup,
      nationality,
      religion,
      feeCategory,
      feeDiscount,
      transportRequired,
      pickupPoint,
      dropPoint,
      remarks,
      status,
      isActive,
      // Fee Slab fields
      feeSlabId,
      feeStructure,
      paymentStatus,
      concessionAmount,
      lateFees,
      scholarshipDetails,
      // Payment fields
      paymentDate,
      paymentMethod,
      transactionId,
      feesPaid,
    } = req.body;

    // Check if student exists
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if email is already taken by another student
    if (email && email !== existingStudent.email) {
      const emailExists = await Student.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered with another student",
        });
      }
    }



    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        middleName,
        lastName,
        email,
        mobileNumber,
        dateOfBirth,
        gender,
        currentAddress,
        mothersName,
        parentsMobileNumber,
        rollNumber,
        bloodGroup,
        nationality,
        religion,
        feeCategory,
        feeDiscount,
        transportRequired,
        pickupPoint,
        dropPoint,
        remarks,
        status,
        isActive,
        // Fee Slab fields
        feeSlabId,
        feeStructure,
        paymentStatus,
        concessionAmount,
        lateFees,
        scholarshipDetails,
        // Payment fields
        paymentDate,
        paymentMethod,
        transactionId,
        feesPaid,
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true }
    ).populate("class", "name grade division")
      .populate("feeSlabId", "slabName totalAmount installments");

    res.json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const Class = require("../models/Class");

    // Check if student exists
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }



    // Remove student from class
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: student._id },
        $inc: { currentStrength: -1 },
      });
    }

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
});

// @route   PATCH /api/students/:id/status
// @desc    Update student status
// @access  Private (Admin)
router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const { status, isActive } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status, isActive, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate("class", "name grade division")
      .populate("feeSlabId", "slabName totalAmount installments");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student status updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student status",
      error: error.message,
    });
  }
});

module.exports = router; 