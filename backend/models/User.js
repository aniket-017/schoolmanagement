const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "principal", "teacher", "student", "cleaner", "bus_driver", "accountant"],
      required: [true, "Role is required"],
    },

    // Contact Information
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Identification
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Personal Information
    dateOfBirth: Date,
    bloodGroup: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    religion: String,
    nationality: String,
    profilePicture: String,

    // Academic/Professional Information
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    qualification: String,
    experience: Number,
    joiningDate: {
      type: Date,
      default: Date.now,
    },

    // Family Information (for students)
    father: {
      name: String,
      occupation: String,
      phone: String,
      email: String,
    },
    mother: {
      name: String,
      occupation: String,
      phone: String,
      email: String,
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },

    // Employment Information
    salary: Number,
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String,
    },

    // System Information
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: function () {
        return this.role === "admin" ? "approved" : "pending";
      },
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    emergencyContact: String,

    // Password Management
    isFirstLogin: {
      type: Boolean,
      default: function () {
        return this.role === "teacher"; // Teachers created by admin need to change password on first login
      },
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ employeeId: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
