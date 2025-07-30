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
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    nationality: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    caste: {
      type: String,
      trim: true,
    },
    motherTongue: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null, ""],
    },
    photo: {
      type: String, // URL to photo
    },

    // Contact & Address Details
    currentAddress: {
      type: String,
      trim: true,
    },
    permanentAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[1-9]\d{9}$/, "Mobile number must be exactly 10 digits and cannot start with 0"],
    },
    optionalMobileNumber: {
      type: String,
      match: [/^[1-9]\d{9}$/, "Mobile number must be exactly 10 digits and cannot start with 0"],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // Parent/Guardian Information
    father: {
      name: {
        type: String,
        trim: true,
      },
      occupation: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
      annualIncome: {
        type: Number,
        min: 0,
      },
    },
    mother: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Mother's name cannot exceed 100 characters"],
      },
      occupation: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
      annualIncome: {
        type: Number,
        min: 0,
      },
    },
    guardian: {
      name: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
    },

    // Academic Information
    admissionNumber: {
      type: String,
      unique: true,
    },
    rollNumber: {
      type: String,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    grade: {
      type: String,
    },
    section: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
    },
    previousSchool: {
      type: String,
      trim: true,
    },
    transferCertificateNumber: {
      type: String,
      trim: true,
    },
    scholarships: [
      {
        name: String,
        amount: Number,
        year: String,
      },
    ],
    learningDisabilities: [
      {
        type: String,
        description: String,
      },
    ],
    specialNeeds: {
      type: String,
      trim: true,
    },

    // Fees & Finance
    feeSlabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeSlab",
    },
    feeStructure: {
      type: String,
      enum: ["regular", "scholarship", "concession", "free"],
      default: "regular",
    },
    concessionDetails: {
      type: {
        name: {
          type: String,
          enum: ["scholarship", "sibling_discount", "merit_based", "need_based", "staff_ward", "free", "other"],
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        discountValue: {
          type: Number,
          min: 0,
        },
        discountAmount: {
          type: Number,
          min: 0,
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        approvedDate: Date,
        reason: String,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    },
    concessionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
    lateFees: {
      type: Number,
      default: 0,
      min: 0,
    },
    scholarshipDetails: {
      type: String,
      trim: true,
    },
    
    // Payment Information
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cheque", "online", "other"],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    feesPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Attendance & Timetable
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    leaveRecords: [
      {
        date: Date,
        type: {
          type: String,
          enum: ["medical", "vacation", "personal", "other"],
        },
        reason: String,
        approved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Exam & Assessment Records
    internalAssessments: [
      {
        subject: String,
        score: Number,
        totalMarks: Number,
        date: Date,
      },
    ],
    externalExams: [
      {
        examName: String,
        subject: String,
        score: Number,
        totalMarks: Number,
        date: Date,
      },
    ],
    progressReports: [
      {
        term: String,
        year: String,
        overallGrade: String,
        remarks: String,
        date: Date,
      },
    ],

    // Behavior, Health & Psychological Records
    disciplineRecords: [
      {
        date: Date,
        incident: String,
        action: String,
        severity: {
          type: String,
          enum: ["minor", "major", "critical"],
        },
      },
    ],
    counselingReports: [
      {
        date: Date,
        counselor: String,
        reason: String,
        notes: String,
        followUpRequired: Boolean,
      },
    ],
    medicalHistory: {
      allergies: [String],
      medicalConditions: [String],
      medications: [String],
      emergencyInstructions: String,
      vaccinationStatus: {
        type: String,
        enum: ["complete", "incomplete", "exempt"],
        default: "complete",
      },
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },

    // Teacher & School Interaction
    teacherRemarks: [
      {
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: Date,
        remark: String,
        type: {
          type: String,
          enum: ["academic", "behavior", "general"],
        },
      },
    ],
    ptmNotes: [
      {
        date: Date,
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        parent: String,
        discussion: String,
        actionItems: [String],
      },
    ],
    extraHelpRequired: [
      {
        subject: String,
        reason: String,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],

    // Co-curricular & Extracurricular
    sportsParticipation: [
      {
        sport: String,
        level: {
          type: String,
          enum: ["school", "district", "state", "national"],
        },
        position: String,
        achievements: [String],
      },
    ],
    clubs: [
      {
        name: String,
        role: String,
        achievements: [String],
      },
    ],
    eventsParticipation: [
      {
        event: String,
        year: String,
        role: String,
        achievement: String,
      },
    ],
    certificates: [
      {
        name: String,
        issuingAuthority: String,
        date: Date,
        description: String,
      },
    ],

    // Documents & Certificates
    documents: {
      birthCertificate: String,
      transferCertificate: String,
      characterCertificate: String,
      medicalCertificate: String,
      photograph: String,
      aadharCard: String,
      casteCertificate: String,
      incomeCertificate: String,
      passport: String,
    },

    // Physical & Health Metrics
    physicalMetrics: {
      height: {
        type: Number, // in cm
        min: 0,
      },
      weight: {
        type: Number, // in kg
        min: 0,
      },
      bmi: {
        type: Number,
        min: 0,
      },
      visionTest: {
        leftEye: String,
        rightEye: String,
        date: Date,
      },
      hearingTest: {
        leftEar: String,
        rightEar: String,
        date: Date,
      },
      dentalRecords: [
        {
          date: Date,
          findings: String,
          recommendations: String,
        },
      ],
      fitnessScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // System & Access Information
    loginCredentials: {
      username: String,
      password: String,
      lastLogin: Date,
    },
    // Student login password (generated automatically)
    loginPassword: {
      type: String,
      required: false,
    },
    rfidCardNumber: {
      type: String,
      trim: true,
    },
    libraryCardNumber: {
      type: String,
      trim: true,
    },
    hostelInformation: {
      roomNumber: String,
      wardenName: String,
      wardenPhone: String,
    },
    transportDetails: {
      required: {
        type: Boolean,
        default: false,
      },
      route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transport",
      },
      pickupPoint: String,
      dropPoint: String,
      busNumber: String,
      driverName: String,
      driverPhone: String,
    },

    // Legacy fields for backward compatibility
    name: {
      type: String,
      trim: true,
    },
    phone: String,
    currentAddress: {
      type: String,
      required: [true, "Current address is required"],
      trim: true,
    },
    mothersName: {
      type: String,
      trim: true,
      maxlength: [100, "Mother's name cannot exceed 100 characters"],
    },
    parentsMobileNumber: {
      type: String,
      match: [/^[\+]?[\d\s\-\(\)]{7,15}$/, "Please enter a valid mobile number"],
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
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ rfidCardNumber: 1 });
studentSchema.index({ libraryCardNumber: 1 });

// Virtual for full name
studentSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.middleName ? this.middleName + " " : ""}${this.lastName}`.trim();
  }
  return this.name || "";
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

  if (!this.admissionNumber) {
    this.admissionNumber = `ADM${Date.now()}`;
  }

  // Generate login password if not provided and roll number and mother's name exist
  if (!this.loginPassword && this.rollNumber && this.mother && this.mother.name) {
    this.loginPassword = `${this.rollNumber}${this.mother.name.replace(/\s+/g, "")}`;
  }

  // Calculate BMI if height and weight are provided
  if (this.physicalMetrics && this.physicalMetrics.height && this.physicalMetrics.weight) {
    const heightInMeters = this.physicalMetrics.height / 100;
    this.physicalMetrics.bmi = (this.physicalMetrics.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }

  // Set legacy name field for backward compatibility
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.middleName ? this.middleName + " " : ""}${this.lastName}`.trim();
  }

  // Set legacy phone field for backward compatibility
  if (this.mobileNumber && !this.phone) {
    this.phone = this.mobileNumber;
  }

  // Set legacy mother name for backward compatibility
  if (this.mother && this.mother.name && !this.mothersName) {
    this.mothersName = this.mother.name;
  }

  // Set legacy parent phone for backward compatibility
  if (this.mother && this.mother.phone && !this.parentsMobileNumber) {
    this.parentsMobileNumber = this.mother.phone;
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

// Method to generate login password
studentSchema.methods.generateLoginPassword = function () {
  if (this.rollNumber && this.mother && this.mother.name) {
    this.loginPassword = `${this.rollNumber}${this.mother.name.replace(/\s+/g, "")}`;
    return this.loginPassword;
  }
  return null;
};

// Method to verify login password
studentSchema.methods.verifyLoginPassword = function (password) {
  return this.loginPassword === password;
};

module.exports = mongoose.model("Student", studentSchema);
