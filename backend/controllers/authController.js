const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (requires admin approval)
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, employeeId, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role,
      phone,
    };

    // Add role-specific fields
    if (role === "teacher" && employeeId) {
      userData.employeeId = employeeId;
    }
    if (role === "student" && studentId) {
      userData.studentId = studentId;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "Registration successful! Please wait for admin approval to login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Check if account is approved
    if (user.status === "pending") {
      return res.status(401).json({
        success: false,
        message: "Your account is pending admin approval. Please wait for approval.",
      });
    }

    if (user.status === "rejected") {
      return res.status(401).json({
        success: false,
        message: "Your account has been rejected. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
      requirePasswordChange: user.isFirstLogin || false,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("class", "name grade section")
      .populate("subjects", "name")
      .populate("subjectsTaught", "name")
      .populate("subjectsSpecializedIn", "name");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, qualification, experience } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (experience !== undefined) updateData.experience = parseInt(experience) || 0;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true })
      .populate("class", "name grade section")
      .populate("subjects", "name");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password and clear first login flag
    user.password = newPassword;
    user.isFirstLogin = false;
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

// @desc    Get pending users (Admin only)
// @route   GET /api/auth/pending-users
// @access  Private (Admin)
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" }).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending users",
    });
  }
};

// @desc    Approve user (Admin only)
// @route   PUT /api/auth/approve-user/:id
// @access  Private (Admin)
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        status: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    console.error("User approval error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving user",
    });
  }
};

// @desc    Reject user (Admin only)
// @route   PUT /api/auth/reject-user/:id
// @access  Private (Admin)
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User rejected successfully",
      user,
    });
  } catch (error) {
    console.error("User rejection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting user",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  rejectUser,
};
