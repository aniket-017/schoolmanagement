const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    studentId: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, "Middle name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },

    // Contact Information
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[\+]?[\d\s\-\(\)]{7,15}$/, "Please enter a valid mobile number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    currentAddress: {
      type: String,
      required: [true, "Current address is required"],
      trim: true,
    },

    // Parent/Guardian Information
    mothersName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
      maxlength: [100, "Mother's name cannot exceed 100 characters"],
    },
    parentsMobileNumber: {
      type: String,
      required: [true, "Parent's mobile number is required"],
      match: [/^[\+]?[\d\s\-\(\)]{7,15}$/, "Please enter a valid mobile number"],
    },

    // Academic Information
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
    },

    // Legacy fields for backward compatibility
    name: {
      type: String,
      trim: true,
    },
    phone: String,
    rollNumber: {
      type: String,
    },
    academicYear: {
      type: String,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    currentGrade: {
      type: String,
    },

    // Family Information (legacy)
    father: {
      name: {
        type: String,
      },
      occupation: String,
      phone: String,
      email: String,
    },
    mother: {
      name: {
        type: String,
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

    // Address Information (legacy)
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    // Additional fields
    bloodGroup: String,
    nationality: String,
    religion: String,

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
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isActive: 1 });

// Virtual for full name
studentSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`.trim();
  }
  return this.name || '';
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

// Pre-save middleware to generate student ID if not provided and set legacy fields
studentSchema.pre("save", function (next) {
  if (!this.studentId) {
    this.studentId = `STU${Date.now()}`;
  }
  
  // Set legacy name field for backward compatibility
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`.trim();
  }
  
  // Set legacy phone field for backward compatibility
  if (this.mobileNumber && !this.phone) {
    this.phone = this.mobileNumber;
  }
  
  // Set legacy mother name for backward compatibility
  if (this.mothersName && !this.mother.name) {
    this.mother.name = this.mothersName;
  }
  
  // Set legacy parent phone for backward compatibility
  if (this.parentsMobileNumber && !this.mother.phone) {
    this.mother.phone = this.parentsMobileNumber;
  }
  
  // Set legacy address for backward compatibility
  if (this.currentAddress && !this.address.street) {
    this.address.street = this.currentAddress;
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
    student_id: this._id,
    academic_year: academicYear,
  }).populate("examination_id");
};

module.exports = mongoose.model("Student", studentSchema); 