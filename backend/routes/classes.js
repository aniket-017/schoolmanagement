const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const { auth, teacherOrAdmin, adminOnly, teacherOnly } = require("../middleware/auth");
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignClassTeacher,
  getAvailableTeachers,
  getTeacherAssignedClasses,
} = require("../controllers/classController");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
});

// Generate student ID
const generateStudentId = () => {
  return `STU${Date.now()}`;
};

// Generate temporary password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Test route to verify API is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Classes API is working",
    timestamp: new Date().toISOString(),
  });
});

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private (Teacher/Admin)
router.get("/", auth, teacherOrAdmin, getAllClasses);

// @route   GET /api/classes/available-teachers
// @desc    Get available teachers for assignment
// @access  Private (Admin only)
router.get("/available-teachers", auth, adminOnly, getAvailableTeachers);

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin only)
router.post("/", auth, adminOnly, createClass);

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private (Teacher/Admin)
router.get("/:id", auth, teacherOrAdmin, getClassById);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin only)
router.put("/:id", auth, adminOnly, updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
router.delete("/:id", auth, adminOnly, deleteClass);

// @route   PUT /api/classes/:id/assign-teacher
// @desc    Assign class teacher
// @access  Private (Admin only)
router.put("/:id/assign-teacher", auth, adminOnly, assignClassTeacher);

// @route   GET /api/classes/teacher/assigned
// @desc    Get classes assigned to current teacher
// @access  Private (Teacher only)
router.get("/teacher/assigned", auth, teacherOnly, getTeacherAssignedClasses);

// ==================== STUDENT MANAGEMENT ROUTES ====================

// @route   GET /api/classes/:id/students
// @desc    Get all students in a class
// @access  Private (Teacher/Admin)
router.get("/:id/students", auth, teacherOrAdmin, async (req, res) => {
  try {
    const Student = require("../models/Student");
    const students = await Student.find({
      class: req.params.id,
      isActive: true,
    }).sort({ rollNumber: 1 });

    res.json({
      success: true,
      data: students || [],
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

// @route   POST /api/classes/:id/students
// @desc    Add a student to a class
// @access  Private (Admin only)
router.post("/:id/students", auth, adminOnly, async (req, res) => {
  try {
    const Class = require("../models/Class");
    const Student = require("../models/Student");
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }
    if (classData.currentStrength >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Class is at maximum capacity",
      });
    }
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      mobileNumber,
      rollNumber,
      grade,
      // Accept all other possible fields
      ...otherFields
    } = req.body;
    if (!firstName || !lastName || !dateOfBirth || !gender || !email || !mobileNumber || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists",
      });
    }
    const existingRollNumber = await Student.findOne({
      class: req.params.id,
      rollNumber: rollNumber,
    });
    if (existingRollNumber) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists in this class",
      });
    }
    const studentId = generateStudentId();
    // Compose the student data
    const studentData = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      mobileNumber,
      rollNumber,
      grade: grade || `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
      class: req.params.id,
      academicYear: classData.academicYear,
      currentGrade: grade || `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
      ...otherFields,
      createdBy: req.user.id,
    };
    const student = await Student.create(studentData);
    classData.students.push(student._id);
    classData.currentStrength += 1;
    await classData.save();
    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        loginPassword: student.loginPassword, // Include generated password
      },
    });
  } catch (error) {
    console.error("Error adding student:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error adding student",
      error: error.message,
    });
  }
});

// @route   GET /api/classes/:id/students/excel-template
// @desc    Download Excel template for bulk student upload
// @access  Private (Admin only)
router.get("/:id/students/excel-template", auth, adminOnly, async (req, res) => {
  try {
    const Class = require("../models/Class");

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Create template data
    const templateData = [
      {
        // Basic Information (Required)
        FirstName: "John",
        MiddleName: "Michael",
        LastName: "Doe",
        DateOfBirth: "2010-05-15",
        Gender: "male",
        Email: "john.doe@example.com",
        MobileNumber: "+1234567890",
        RollNumber: "001",

        // Personal Information (Optional)
        Nationality: "Indian",
        Religion: "Hindu",
        Caste: "General",
        MotherTongue: "Hindi",
        BloodGroup: "A+",
        Photo: "photo_url_here",

        // Contact & Address Details
        CurrentAddress: "123 Main Street, City, State",
        PermanentAddress: "123 Main Street, City, State",
        City: "Chhatrapati Sambhajinagar",
        State: "Maharashtra",
        PinCode: "400001",

        // Parent/Guardian Information
        FatherName: "Robert Doe",
        FatherOccupation: "Engineer",
        FatherPhone: "+1234567891",
        FatherEmail: "robert.doe@example.com",
        FatherIncome: "800000",
        MothersName: "Jane Doe",
        MotherOccupation: "Teacher",
        ParentsMobileNumber: "+1234567892",
        MotherEmail: "jane.doe@example.com",
        MotherIncome: "600000",
        GuardianName: "",
        GuardianRelation: "",
        GuardianPhone: "",
        GuardianEmail: "",

        // Academic Information
        AdmissionNumber: "ADM2024001",
        Section: "A",
        PreviousSchool: "Previous School Name",
        TransferCertificateNumber: "TC123456",
        SpecialNeeds: "",

        // Fees & Finance
        FeeStructure: "regular",
        FeeDiscount: "0",
        PaymentStatus: "pending",
        LateFees: "0",

        // Physical & Health Metrics
        Height: "150",
        Weight: "45",
        VisionTestLeftEye: "6/6",
        VisionTestRightEye: "6/6",
        VisionTestDate: "2024-01-15",
        HearingTestLeftEar: "Normal",
        HearingTestRightEar: "Normal",
        HearingTestDate: "2024-01-15",
        FitnessScore: "85",

        // Medical Information
        Allergies: "Dust, Pollen",
        MedicalConditions: "None",
        Medications: "None",
        EmergencyInstructions: "Contact parents immediately",
        VaccinationStatus: "complete",

        // Emergency Contact
        EmergencyContactName: "Robert Doe",
        EmergencyContactRelation: "Father",
        EmergencyContactPhone: "+1234567891",
        EmergencyContactEmail: "robert.doe@example.com",

        // System & Access Information
        RFIDCardNumber: "RFID001",
        LibraryCardNumber: "LIB001",
        HostelRoomNumber: "",
        HostelWardenName: "",
        HostelWardenPhone: "",

        // Transport Details
        TransportRequired: "false",
        PickupPoint: "",
        DropPoint: "",
        BusNumber: "",
        DriverName: "",
        DriverPhone: "",

        // Documents
        BirthCertificate: "birth_cert_url",
        TransferCertificate: "tc_url",
        CharacterCertificate: "character_cert_url",
        MedicalCertificate: "medical_cert_url",
        AadharCard: "aadhar_url",
        CasteCertificate: "",
        IncomeCertificate: "",
        Passport: "",
      },
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths for all fields
    const columnWidths = [
      // Basic Information
      { wch: 15 }, // FirstName
      { wch: 15 }, // MiddleName
      { wch: 15 }, // LastName
      { wch: 12 }, // DateOfBirth
      { wch: 10 }, // Gender
      { wch: 25 }, // Email
      { wch: 15 }, // MobileNumber
      { wch: 10 }, // RollNumber

      // Personal Information
      { wch: 12 }, // Nationality
      { wch: 12 }, // Religion
      { wch: 12 }, // Caste
      { wch: 15 }, // MotherTongue
      { wch: 10 }, // BloodGroup
      { wch: 20 }, // Photo

      // Contact & Address
      { wch: 40 }, // CurrentAddress
      { wch: 40 }, // PermanentAddress
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }, // PinCode

      // Parent Information
      { wch: 20 }, // FatherName
      { wch: 20 }, // FatherOccupation
      { wch: 15 }, // FatherPhone
      { wch: 25 }, // FatherEmail
      { wch: 12 }, // FatherIncome
      { wch: 20 }, // MothersName
      { wch: 20 }, // MotherOccupation
      { wch: 15 }, // ParentsMobileNumber
      { wch: 25 }, // MotherEmail
      { wch: 12 }, // MotherIncome
      { wch: 20 }, // GuardianName
      { wch: 15 }, // GuardianRelation
      { wch: 15 }, // GuardianPhone
      { wch: 25 }, // GuardianEmail

      // Academic Information
      { wch: 15 }, // AdmissionNumber
      { wch: 10 }, // Section
      { wch: 25 }, // PreviousSchool
      { wch: 20 }, // TransferCertificateNumber
      { wch: 20 }, // SpecialNeeds

      // Fees & Finance
      { wch: 15 }, // FeeStructure
      { wch: 12 }, // FeeDiscount
      { wch: 15 }, // PaymentStatus
      { wch: 12 }, // LateFees

      // Physical & Health
      { wch: 10 }, // Height
      { wch: 10 }, // Weight
      { wch: 15 }, // VisionTestLeftEye
      { wch: 15 }, // VisionTestRightEye
      { wch: 12 }, // VisionTestDate
      { wch: 15 }, // HearingTestLeftEar
      { wch: 15 }, // HearingTestRightEar
      { wch: 12 }, // HearingTestDate
      { wch: 12 }, // FitnessScore

      // Medical Information
      { wch: 20 }, // Allergies
      { wch: 20 }, // MedicalConditions
      { wch: 20 }, // Medications
      { wch: 30 }, // EmergencyInstructions
      { wch: 15 }, // VaccinationStatus

      // Emergency Contact
      { wch: 20 }, // EmergencyContactName
      { wch: 15 }, // EmergencyContactRelation
      { wch: 15 }, // EmergencyContactPhone
      { wch: 25 }, // EmergencyContactEmail

      // System & Access
      { wch: 15 }, // RFIDCardNumber
      { wch: 15 }, // LibraryCardNumber
      { wch: 15 }, // HostelRoomNumber
      { wch: 20 }, // HostelWardenName
      { wch: 15 }, // HostelWardenPhone

      // Transport Details
      { wch: 15 }, // TransportRequired
      { wch: 20 }, // PickupPoint
      { wch: 20 }, // DropPoint
      { wch: 12 }, // BusNumber
      { wch: 20 }, // DriverName
      { wch: 15 }, // DriverPhone

      // Documents
      { wch: 20 }, // BirthCertificate
      { wch: 20 }, // TransferCertificate
      { wch: 20 }, // CharacterCertificate
      { wch: 20 }, // MedicalCertificate
      { wch: 15 }, // AadharCard
      { wch: 20 }, // CasteCertificate
      { wch: 20 }, // IncomeCertificate
      { wch: 15 }, // Passport
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Students Template");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="students_template_${classData.grade}${classData.division}.xlsx"`
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "Error generating template",
      error: error.message,
    });
  }
});

// @route   POST /api/classes/:id/students/bulk
// @desc    Bulk upload students to a class
// @access  Private (Admin only)
router.post("/:id/students/bulk", auth, adminOnly, upload.single("file"), async (req, res) => {
  try {
    const Class = require("../models/Class");
    const Student = require("../models/Student");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Read Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const results = {
      successful: [],
      failed: [],
      duplicates: [],
    };

    let uploadedCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel rows start from 2 (1 is header)

      try {
        // Validate required fields
        if (!row.FirstName || !row.LastName || !row.Email || !row.RollNumber) {
          results.failed.push({
            row: rowNumber,
            error: "FirstName, LastName, Email, and RollNumber are required",
          });
          continue;
        }

        // Check if student already exists with same email
        const existingStudent = await Student.findOne({ email: row.Email });
        if (existingStudent) {
          results.duplicates.push({
            row: rowNumber,
            data: row,
            error: "Email already exists",
          });
          continue;
        }

        // Check if roll number already exists in the class
        const existingRollNumber = await Student.findOne({
          class: req.params.id,
          rollNumber: row.RollNumber,
        });
        if (existingRollNumber) {
          results.duplicates.push({
            row: rowNumber,
            data: row,
            error: "Roll number already exists in this class",
          });
          continue;
        }

        // Check if class is full
        if (classData.currentStrength >= classData.maxStudents) {
          results.failed.push({
            row: rowNumber,
            error: "Class is at maximum capacity",
          });
          continue;
        }

        // Generate student ID
        const studentId = generateStudentId();

        // Create student
        const studentData = {
          firstName: row.FirstName,
          middleName: row.MiddleName || "",
          lastName: row.LastName,
          email: row.Email,
          mobileNumber: row.MobileNumber || row.Phone || "",
          rollNumber: row.RollNumber,
          dateOfBirth: row.DateOfBirth || null,
          gender: row.Gender || "other",
          currentAddress: row.CurrentAddress || row.Address || "",
          grade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
          class: req.params.id,
          academicYear: classData.academicYear,
          currentGrade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
          createdBy: req.user.id,
        };

        // Personal Information
        if (row.Nationality) studentData.nationality = row.Nationality;
        if (row.Religion) studentData.religion = row.Religion;
        if (row.Caste) studentData.caste = row.Caste;
        if (row.MotherTongue) studentData.motherTongue = row.MotherTongue;
        if (row.BloodGroup) studentData.bloodGroup = row.BloodGroup;
        if (row.Photo) studentData.photo = row.Photo;

        // Contact & Address Details
        if (row.PermanentAddress) studentData.permanentAddress = row.PermanentAddress;
        if (row.City) studentData.city = row.City;
        if (row.State) studentData.state = row.State;
        if (row.PinCode) studentData.pinCode = row.PinCode;

        // Parent/Guardian Information
        if (row.FatherName || row.FatherOccupation || row.FatherPhone || row.FatherEmail || row.FatherIncome) {
          studentData.father = {
            name: row.FatherName || "",
            occupation: row.FatherOccupation || "",
            phone: row.FatherPhone || "",
            email: row.FatherEmail || "",
            annualIncome: row.FatherIncome ? parseFloat(row.FatherIncome) : undefined,
          };
        }

        if (row.MothersName || row.MotherOccupation || row.MotherPhone || row.ParentsMobileNumber || row.MotherEmail || row.MotherIncome) {
          studentData.mother = {
            name: row.MothersName || row.ParentName || "",
            occupation: row.MotherOccupation || "",
            phone: row.ParentsMobileNumber || row.MotherPhone || row.ParentPhone || "",
            email: row.MotherEmail || "",
            annualIncome: row.MotherIncome ? parseFloat(row.MotherIncome) : undefined,
          };
        }

        if (row.GuardianName || row.GuardianRelation || row.GuardianPhone || row.GuardianEmail) {
          studentData.guardian = {
            name: row.GuardianName || "",
            relation: row.GuardianRelation || "",
            phone: row.GuardianPhone || "",
            email: row.GuardianEmail || "",
          };
        }

        // Academic Information
        if (row.AdmissionNumber) studentData.admissionNumber = row.AdmissionNumber;
        if (row.Section) studentData.section = row.Section;
        if (row.PreviousSchool) studentData.previousSchool = row.PreviousSchool;
        if (row.TransferCertificateNumber) studentData.transferCertificateNumber = row.TransferCertificateNumber;
        if (row.SpecialNeeds) studentData.specialNeeds = row.SpecialNeeds;

        // Fees & Finance
        if (row.FeeStructure) studentData.feeStructure = row.FeeStructure;
        if (row.FeeDiscount) studentData.feeDiscount = parseFloat(row.FeeDiscount);
        if (row.PaymentStatus) studentData.paymentStatus = row.PaymentStatus;
        if (row.LateFees) studentData.lateFees = parseFloat(row.LateFees);

        // Physical & Health Metrics
        if (row.Height || row.Weight || row.VisionTest || row.HearingTest || row.FitnessScore) {
          studentData.physicalMetrics = {
            height: row.Height ? parseFloat(row.Height) : undefined,
            weight: row.Weight ? parseFloat(row.Weight) : undefined,
            visionTest: row.VisionTest
              ? {
                  leftEye: row.VisionTestLeftEye || "",
                  rightEye: row.VisionTestRightEye || "",
                  date: row.VisionTestDate ? new Date(row.VisionTestDate) : undefined,
                }
              : undefined,
            hearingTest: row.HearingTest
              ? {
                  leftEar: row.HearingTestLeftEar || "",
                  rightEar: row.HearingTestRightEar || "",
                  date: row.HearingTestDate ? new Date(row.HearingTestDate) : undefined,
                }
              : undefined,
            fitnessScore: row.FitnessScore ? parseFloat(row.FitnessScore) : undefined,
          };
        }

        // Medical Information
        if (
          row.Allergies ||
          row.MedicalConditions ||
          row.Medications ||
          row.EmergencyInstructions ||
          row.VaccinationStatus
        ) {
          studentData.medicalHistory = {
            allergies: row.Allergies ? row.Allergies.split(",").map((a) => a.trim()) : [],
            medicalConditions: row.MedicalConditions ? row.MedicalConditions.split(",").map((c) => c.trim()) : [],
            medications: row.Medications ? row.Medications.split(",").map((m) => m.trim()) : [],
            emergencyInstructions: row.EmergencyInstructions || "",
            vaccinationStatus: row.VaccinationStatus || "complete",
          };
        }

        // Emergency Contact
        if (
          row.EmergencyContactName ||
          row.EmergencyContactRelation ||
          row.EmergencyContactPhone ||
          row.EmergencyContactEmail
        ) {
          studentData.emergencyContact = {
            name: row.EmergencyContactName || "",
            relation: row.EmergencyContactRelation || "",
            phone: row.EmergencyContactPhone || "",
            email: row.EmergencyContactEmail || "",
          };
        }

        // System & Access Information
        if (row.RFIDCardNumber) studentData.rfidCardNumber = row.RFIDCardNumber;
        if (row.LibraryCardNumber) studentData.libraryCardNumber = row.LibraryCardNumber;
        if (row.HostelRoomNumber || row.HostelWardenName || row.HostelWardenPhone) {
          studentData.hostelInformation = {
            roomNumber: row.HostelRoomNumber || "",
            wardenName: row.HostelWardenName || "",
            wardenPhone: row.HostelWardenPhone || "",
          };
        }

        // Transport Details
        if (
          row.TransportRequired ||
          row.PickupPoint ||
          row.DropPoint ||
          row.BusNumber ||
          row.DriverName ||
          row.DriverPhone
        ) {
          studentData.transportDetails = {
            required: row.TransportRequired === "true" || row.TransportRequired === true,
            pickupPoint: row.PickupPoint || "",
            dropPoint: row.DropPoint || "",
            busNumber: row.BusNumber || "",
            driverName: row.DriverName || "",
            driverPhone: row.DriverPhone || "",
          };
        }

        // Documents
        if (
          row.BirthCertificate ||
          row.TransferCertificate ||
          row.CharacterCertificate ||
          row.MedicalCertificate ||
          row.AadharCard ||
          row.CasteCertificate ||
          row.IncomeCertificate ||
          row.Passport
        ) {
          studentData.documents = {
            birthCertificate: row.BirthCertificate || "",
            transferCertificate: row.TransferCertificate || "",
            characterCertificate: row.CharacterCertificate || "",
            medicalCertificate: row.MedicalCertificate || "",
            photograph: row.Photo || "",
            aadharCard: row.AadharCard || "",
            casteCertificate: row.CasteCertificate || "",
            incomeCertificate: row.IncomeCertificate || "",
            passport: row.Passport || "",
          };
        }

        // Legacy fields for backward compatibility
        studentData.mothersName = row.MothersName || row.ParentName || "";
        studentData.parentsMobileNumber = row.ParentsMobileNumber || row.ParentPhone || "";
        studentData.address = {
          street: row.CurrentAddress || row.Address || "",
          city: row.City || "",
          state: row.State || "",
          zipCode: row.ZipCode || "",
          country: row.Country || "India",
        };

        const student = await Student.create(studentData);

        // Add student to class
        classData.students.push(student._id);
        classData.currentStrength += 1;

        results.successful.push({
          row: rowNumber,
          student: {
            name: student.name,
            email: student.email,
            studentId: student.studentId,
            rollNumber: student.rollNumber,
            loginPassword: student.loginPassword, // Include generated password
          },
        });

        uploadedCount++;
      } catch (error) {
        results.failed.push({
          row: rowNumber,
          error: error.message,
        });
      }
    }

    // Save class with updated student count
    await classData.save();

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedCount} students`,
      uploadedCount,
      results,
    });
  } catch (error) {
    console.error("Error bulk uploading students:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk uploading students",
      error: error.message,
    });
  }
});

// @route   DELETE /api/classes/:id/students/:studentId
// @desc    Remove a student from a class
// @access  Private (Admin only)
router.delete("/:id/students/:studentId", auth, adminOnly, async (req, res) => {
  try {
    const Class = require("../models/Class");
    const Student = require("../models/Student");

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student exists and is in the class
    const studentIndex = classData.students.indexOf(req.params.studentId);
    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this class",
      });
    }

    // Remove student from class
    classData.students.splice(studentIndex, 1);
    classData.currentStrength = Math.max(0, classData.currentStrength - 1);
    await classData.save();

    // Delete the student record
    await Student.findByIdAndDelete(req.params.studentId);

    res.json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    res.status(500).json({
      success: false,
      message: "Error removing student from class",
      error: error.message,
    });
  }
});

// @route   GET /api/classes/:id/subjects
// @desc    Get all subjects in a class
// @access  Private (Teacher/Admin)
router.get("/:id/subjects", auth, teacherOrAdmin, async (req, res) => {
  try {
    const Class = require("../models/Class");
    const classData = await Class.findById(req.params.id)
      .populate({
        path: "subjects.subject",
        select: "name code description",
      })
      .populate({
        path: "subjects.teacher",
        select: "name email",
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      data: classData.subjects || [],
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects",
      error: error.message,
    });
  }
});

// @route   POST /api/classes/:id/subjects
// @desc    Add a subject to a class
// @access  Private (Admin only)
router.post("/:id/subjects", auth, adminOnly, async (req, res) => {
  try {
    const Class = require("../models/Class");
    const Subject = require("../models/Subject");
    const { name, code, description, teacherId } = req.body;

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Create or find subject
    let subject;
    if (code) {
      subject = await Subject.findOne({ code });
      if (!subject) {
        subject = await Subject.create({
          name,
          code,
          description,
        });
      }
    } else {
      subject = await Subject.create({
        name,
        code: `SUB${Date.now()}`,
        description,
      });
    }

    // Add subject to class
    classData.subjects.push({
      subject: subject._id,
      teacher: teacherId || null,
    });

    await classData.save();

    res.status(201).json({
      success: true,
      message: "Subject added successfully",
      data: {
        id: subject._id,
        name: subject.name,
        code: subject.code,
      },
    });
  } catch (error) {
    console.error("Error adding subject:", error);
    res.status(500).json({
      success: false,
      message: "Error adding subject",
      error: error.message,
    });
  }
});

// @route   DELETE /api/classes/:id/subjects/:subjectId
// @desc    Remove a subject from a class
// @access  Private (Admin only)
router.delete("/:id/subjects/:subjectId", auth, adminOnly, async (req, res) => {
  try {
    const Class = require("../models/Class");

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Find and remove subject from class
    const subjectIndex = classData.subjects.findIndex((sub) => sub.subject.toString() === req.params.subjectId);

    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Subject not found in this class",
      });
    }

    classData.subjects.splice(subjectIndex, 1);
    await classData.save();

    res.json({
      success: true,
      message: "Subject removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing subject from class:", error);
    res.status(500).json({
      success: false,
      message: "Error removing subject from class",
      error: error.message,
    });
  }
});

// @route   GET /api/classes/:id/students/excel-template
// @desc    Download Excel template for bulk student upload
// @access  Private (Admin only)
router.get("/:id/students/excel-template", auth, adminOnly, (req, res) => {
  try {
    // Define the template structure
    const templateData = [
      {
        Name: "John Doe",
        Email: "john.doe@school.com",
        Phone: "+1234567890",
        DateOfBirth: "2010-05-15",
        ParentName: "Mike Doe",
        ParentPhone: "+1234567891",
        Address: "123 Main St",
        City: "Anytown",
        State: "State",
        ZipCode: "12345",
        Country: "Country",
        RollNumber: "STU001",
      },
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // DateOfBirth
      { wch: 20 }, // ParentName
      { wch: 15 }, // ParentPhone
      { wch: 30 }, // Address
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }, // ZipCode
      { wch: 15 }, // Country
      { wch: 12 }, // RollNumber
    ];
    worksheet["!cols"] = columnWidths;

    xlsx.utils.book_append_sheet(workbook, worksheet, "Students Template");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=students_template.xlsx");
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "Error generating template",
      error: error.message,
    });
  }
});

module.exports = router;
