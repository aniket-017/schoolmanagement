const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    
    // Check if it's a student token or regular user token
    if (decoded.type === 'student') {
      user = await Student.findById(decoded.id).select("-loginPassword");
      if (user) {
        // Add role for consistency
        user.role = 'student';
      }
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorize("admin");

// Principal (superadmin) only middleware  
const principalOnly = authorize("principal");

// Admin or Principal middleware (for user management)
const adminOrPrincipal = authorize("admin", "principal");

// Teacher and Admin middleware
const teacherOrAdmin = authorize("teacher", "admin");

// Teacher only middleware
const teacherOnly = authorize("teacher");

// Student, Parent, Teacher, and Admin middleware
const authenticated = authorize("student", "parent", "teacher", "admin");

module.exports = {
  auth,
  authorize,
  adminOnly,
  principalOnly,
  adminOrPrincipal,
  teacherOrAdmin,
  teacherOnly,
  authenticated,
};
