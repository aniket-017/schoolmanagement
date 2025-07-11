const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      match: [/^[\+]?[\d\s\-\(\)]{7,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodGroup: String,
    nationality: String,
    religion: String,

    // Academic Information
    studentId: {
      type: String,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    currentGrade: {
      type: String,
      required: [true, "Current grade is required"],
    },

    // Family Information
    father: {
      name: {
        type: String,
        required: [true, "Father's name is required"],
      },
      occupation: String,
      phone: String,
      email: String,
    },
    mother: {
      name: {
        type: String,
        required: [true, "Mother's name is required"],
      },
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

    // Address Information
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    // Emergency Contact
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },

    // Medical Information
    medicalInfo: {
      allergies: [String],
      medicalConditions: [String],
      medications: [String],
      emergencyInstructions: String,
    },

    // Academic Performance
    academicPerformance: {
      previousSchool: String,
      previousGrade: String,
      achievements: [String],
      specialNeeds: String,
    },

    // System Information
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "graduated", "transferred"],
      default: "active",
    },
    enrollmentStatus: {
      type: String,
      enum: ["enrolled", "pending", "withdrawn"],
      default: "enrolled",
    },

    // Fee Information
    feeCategory: {
      type: String,
      enum: ["regular", "scholarship", "concession"],
      default: "regular",
    },
    feeDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Transport Information
    transportRequired: {
      type: Boolean,
      default: false,
    },
    transportRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
    },
    pickupPoint: String,
    dropPoint: String,

    // Documents
    documents: {
      birthCertificate: String,
      transferCertificate: String,
      characterCertificate: String,
      medicalCertificate: String,
      photograph: String,
    },

    // Remarks
    remarks: String,
    notes: [String],

    // Audit Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
studentSchema.index({ email: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isActive: 1 });

// Virtual for full name
studentSchema.virtual("fullName").get(function () {
  return this.name;
});

// Virtual for age
studentSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware to generate student ID if not provided
studentSchema.pre("save", function (next) {
  if (!this.studentId) {
    this.studentId = `STU${Date.now()}`;
  }
  next();
});

// Method to get student's current class details
studentSchema.methods.getCurrentClass = async function () {
  return await mongoose.model("Class").findById(this.class);
};

// Method to get student's attendance
studentSchema.methods.getAttendance = async function (startDate, endDate) {
  const Attendance = mongoose.model("Attendance");
  return await Attendance.find({
    student: this._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};

// Method to get student's grades
studentSchema.methods.getGrades = async function (academicYear) {
  const Grade = mongoose.model("Grade");
  return await Grade.find({
    student: this._id,
    academicYear: academicYear || this.academicYear,
  }).populate("subject");
};

// Static method to find students by class
studentSchema.statics.findByClass = function (classId) {
  return this.find({ class: classId, isActive: true }).sort({ rollNumber: 1 });
};

// Static method to find students by status
studentSchema.statics.findByStatus = function (status) {
  return this.find({ status, isActive: true }).sort({ name: 1 });
};

// Static method to get student count by class
studentSchema.statics.getCountByClass = function (classId) {
  return this.countDocuments({ class: classId, isActive: true });
};

module.exports = mongoose.model("Student", studentSchema); 