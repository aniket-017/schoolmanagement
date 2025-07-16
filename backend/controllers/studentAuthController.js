const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// Generate JWT token for students
const generateStudentToken = (id) => {
  return jwt.sign({ id, type: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Student login
// @route   POST /api/student-auth/login
// @access  Public
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find student by email
    const student = await Student.findOne({ email })
      .populate("class", "name grade section")
      .select("+loginPassword");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Check if student has login password
    if (!student.loginPassword) {
      return res.status(401).json({
        success: false,
        message: "Login credentials not set. Please contact administrator.",
      });
    }

    // Verify password
    if (!student.verifyLoginPassword(password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateStudentToken(student._id);

    // Update last login
    student.loginCredentials = {
      ...student.loginCredentials,
      lastLogin: new Date(),
    };
    await student.save();

    // Remove sensitive data from response
    const studentResponse = student.toObject();
    delete studentResponse.loginPassword;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: student._id,
        name: student.fullName || student.name,
        email: student.email,
        role: "student",
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        class: student.class,
        isFirstLogin: false, // Students don't need password change on first login
      },
      requirePasswordChange: false,
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get student profile
// @route   GET /api/student-auth/profile
// @access  Private (Student)
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("class", "name grade section")
      .select("-loginPassword");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: student._id,
        name: student.fullName || student.name,
        email: student.email,
        role: "student",
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        class: student.class,
        mobileNumber: student.mobileNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.currentAddress,
        mother: student.mother,
        father: student.father,
      },
    });
  } catch (error) {
    console.error("Student profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/student-auth/profile
// @access  Private (Student)
const updateStudentProfile = async (req, res) => {
  try {
    const { mobileNumber, currentAddress } = req.body;

    // Build update object with only allowed fields
    const updateData = {};
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    if (currentAddress !== undefined) updateData.currentAddress = currentAddress;

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("class", "name grade section")
      .select("-loginPassword");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: student._id,
        name: student.fullName || student.name,
        email: student.email,
        role: "student",
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        class: student.class,
        mobileNumber: student.mobileNumber,
        currentAddress: student.currentAddress,
      },
    });
  } catch (error) {
    console.error("Student profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// @desc    Generate student login password
// @route   POST /api/student-auth/generate-password/:studentId
// @access  Private (Admin only)
const generateStudentPassword = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Generate password
    const password = student.generateLoginPassword();
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate password. Roll number and mother's name are required.",
      });
    }

    await student.save();

    res.json({
      success: true,
      message: "Student login password generated successfully",
      data: {
        studentId: student.studentId,
        name: student.fullName || student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        motherName: student.mother?.name,
        loginPassword: password,
      },
    });
  } catch (error) {
    console.error("Generate student password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating password",
    });
  }
};

// @desc    Change student password
// @route   PUT /api/student-auth/change-password
// @access  Private (Student)
const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const student = await Student.findById(req.user.id).select("+loginPassword");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify current password
    if (!student.verifyLoginPassword(currentPassword)) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    student.loginPassword = newPassword;
    student.loginCredentials = {
      ...student.loginCredentials,
      lastPasswordChange: new Date(),
    };
    await student.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Student password change error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

module.exports = {
  studentLogin,
  getStudentProfile,
  updateStudentProfile,
  generateStudentPassword,
  changeStudentPassword,
}; 