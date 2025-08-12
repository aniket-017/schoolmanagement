const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
    const user = await User.findById(req.user.id).populate("class", "name grade section").populate("subjects", "name");

    // Format the name properly for teachers
    let formattedUser = user.toObject();
    if (user.role === "teacher" || user.role === "admin" || user.role === "principal") {
      // Create a full name from firstName, middleName, and lastName
      const nameParts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
      formattedUser.name = nameParts.length > 0 ? nameParts.join(" ") : user.name || user.email;
      formattedUser.fullName = formattedUser.name;
    }

    res.json({
      success: true,
      user: formattedUser,
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Update last logout time if needed
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastLogout = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  rejectUser,
};

// --- Forgot/Reset Password Implementation ---

// Internal helper to create a reusable SMTP transporter
function createMailer() {
  const service = process.env.SMPT_SERVICE;
  const host = process.env.SMPT_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMPT_PORT || 465);
  const secure = port === 465; // true for 465, false for other ports
  const user = process.env.SMPT_MAIL;
  const pass = process.env.SMPT_PASSWORD;

  return nodemailer.createTransport(
    service
      ? {
          service,
          auth: { user, pass },
        }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
        }
  );
}

// @desc    Initiate password reset (send email)
// @route   POST /api/auth/forgot-password
// @access  Public
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal whether the email exists
      return res.json({ success: true, message: "If this email is registered, a reset link has been sent" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpire = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();

    // Determine the app URL: prefer explicit env, else derive from request host
    const derivedProtocol = req.get("x-forwarded-proto") || req.protocol || "https";
    const derivedOrigin = `${derivedProtocol}://${req.get("host")}`;
    const appUrl = process.env.APP_URL || process.env.CLIENT_URL || derivedOrigin || "http://localhost:5173";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const transporter = createMailer();
    const from = process.env.SMPT_MAIL || "no-reply@school.com";

    await transporter.sendMail({
      from: `School Management <${from}>`,
      to: user.email,
      subject: "Password Reset Instructions",
      text: `Hello ${
        user.name || "User"
      },\n\nWe received a request to reset your password. Use the link below (valid for 15 minutes):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">
          <p>Hello ${user.name || "User"},</p>
          <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#1d4ed8;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Reset your password</a>
          </p>
          <p>If the button doesn’t work, copy and paste this link into your browser:</p>
          <div style="background:#f3f4f6;padding:12px;border-radius:8px;word-break:break-all;font-family:Consolas,Monaco,monospace;font-size:13px">${resetUrl}</div>
          <p style="margin-top:24px;color:#555">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "If this email is registered, a reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
}

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
async function resetPassword(req, res) {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: "Token, email and new password are required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    user.lastPasswordChange = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}

// Export new handlers
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
