const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      // No longer required
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
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other", "Male", "Female", "Other", ""], default: "" },
    dateOfBirth: Date,
    socialCategory: { type: String },
    disabilityStatus: { type: String },
    aadhaarNumber: { type: String },
    // Professional Information
    teacherType: { type: String },
    natureOfAppointment: { type: String },
    appointedUnder: { type: String },
    dateOfJoiningService: Date,
    dateOfJoiningPresentSchool: Date,
    udiseCodePreviousSchool: { type: String },
    // Educational Qualification
    highestAcademicQualification: { type: String },
    highestProfessionalQualification: { type: String },
    subjectsSpecializedIn: [{ type: String }],
    mediumOfInstruction: { type: String },
    // Training Details
    inServiceTraining: { type: Boolean, default: false },
    ictTraining: { type: Boolean, default: false },
    flnTraining: { type: Boolean, default: false },
    inclusiveEducationTraining: { type: Boolean, default: false },
    // Posting & Work Details
    classesTaught: { type: String },
    subjectsTaught: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    periodsPerWeek: { type: Number },
    multipleSubjectsOrGrades: { type: Boolean, default: false },
    nonTeachingDuties: { type: Boolean, default: false },
    nonTeachingDutiesDetails: { type: String },
    // Salary & Employment
    salaryBand: { type: String },
    salaryPaymentMode: { type: String },
    workingStatus: { type: String },
    bloodGroup: String,
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

    // Teacher Lecture Information
    lectureSchedule: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        periodNumber: Number,
        startTime: String,
        endTime: String,
        room: String,
        type: {
          type: String,
          enum: ["theory", "practical", "lab", "sports", "library"],
          default: "theory",
        },
        academicYear: String,
        semester: String,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    totalPeriodsPerWeek: {
      type: Number,
      default: 0,
    },
    maxPeriodsPerDay: {
      type: Number,
      default: 8,
    },
    preferredSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    teachingSpecializations: [String],
    availability: {
      Monday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
      Tuesday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
      Wednesday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
      Thursday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
      Friday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
      Saturday: { available: { type: Boolean, default: true }, maxPeriods: { type: Number, default: 8 } },
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
userSchema.index({ role: 1 });

// Add a virtual for backward compatibility
userSchema.virtual("fullName").get(function () {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ");
});

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
