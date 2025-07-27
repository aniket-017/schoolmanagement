const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const { auth, adminOrPrincipal } = require("../middleware/auth");
const User = require("../models/User");

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

// Generate temporary password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// @route   GET /api/users/subjects
// @desc    Get all active subjects
// @access  Private (Admin/Principal only)
router.get("/subjects", auth, adminOrPrincipal, async (req, res) => {
  try {
    const Subject = require("../models/Subject");
    const subjects = await Subject.find({}).select("name").sort({ name: 1 });
    res.json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
    });
  }
});

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin/Principal only)
router.get("/", auth, adminOrPrincipal, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    // Build filter query
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select("-password")
      .populate("subjects", "name")
      .populate("class", "name grade section")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalUsers: total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
});

// @route   POST /api/users/teacher
// @desc    Create a new teacher
// @access  Private (Admin/Principal only)
router.post("/teacher", auth, adminOrPrincipal, async (req, res) => {
  try {
    // Destructure all new fields from req.body
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      socialCategory,
      disabilityStatus,
      aadhaarNumber,
      teacherType,
      natureOfAppointment,
      appointedUnder,
      dateOfJoiningService,
      dateOfJoiningPresentSchool,
      udiseCodePreviousSchool,
      highestAcademicQualification,
      highestProfessionalQualification,
      subjects,
      mediumOfInstruction,
      inServiceTraining,
      ictTraining,
      flnTraining,
      inclusiveEducationTraining,
      classesTaught,
      periodsPerWeek,
      multipleSubjectsOrGrades,
      nonTeachingDuties,
      nonTeachingDutiesDetails,
      salaryBand,
      salaryPaymentMode,
      workingStatus,
      phone,
      email,
      address,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Generate employee ID and temporary password
    const employeeId = `EMP${Date.now()}`;
    const tempPassword = generateTempPassword();

    // Create teacher
    const teacher = await User.create({
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      socialCategory,
      disabilityStatus,
      aadhaarNumber,
      teacherType,
      natureOfAppointment,
      appointedUnder,
      dateOfJoiningService,
      dateOfJoiningPresentSchool,
      udiseCodePreviousSchool,
      highestAcademicQualification,
      highestProfessionalQualification,
      subjects,
      mediumOfInstruction,
      inServiceTraining,
      ictTraining,
      flnTraining,
      inclusiveEducationTraining,
      classesTaught,
      periodsPerWeek,
      multipleSubjectsOrGrades,
      nonTeachingDuties,
      nonTeachingDutiesDetails,
      salaryBand,
      salaryPaymentMode,
      workingStatus,
      phone,
      email,
      address,
      password: tempPassword,
      role: "teacher",
      employeeId,
      status: "approved",
      approvedBy: req.user.id,
      approvedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        employeeId: teacher.employeeId,
        tempPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating teacher",
      error: error.message,
    });
  }
});

// @route   GET /api/users/excel-template
// @desc    Download Excel template for bulk teacher upload
// @access  Private (Admin/Principal only)
router.get("/excel-template", auth, adminOrPrincipal, (req, res) => {
  try {
    // Define the template structure with exact column names matching the teacher form
    const templateData = [
      {
        // Personal Information (Required fields marked with *)
        "First Name*": "John",
        "Middle Name": "Michael",
        "Last Name*": "Doe",
        "Gender*": "Male",
        "Date of Birth": "1990-01-15",
        "Social Category": "General",
        "Disability Status": "None",
        "Aadhaar Number": "123456789012",

        // Professional Information
        "Teacher Type": "Regular",
        "Nature of Appointment": "Permanent",
        "Appointed Under": "Government",
        "Date of Joining Service": "2015-06-01",
        "Date of Joining Present School": "2020-09-01",
        "UDISE Code Previous School": "12345678901",

        // Educational Qualification
        "Highest Academic Qualification": "M.Sc Mathematics",
        "Highest Professional Qualification": "B.Ed",
        Subjects: "Mathematics,Physics",
        "Medium of Instruction": "English",

        // Training Details
        "In-Service Training": "Yes",
        "ICT Training": "Yes",
        "FLN Training": "No",
        "Inclusive Education Training": "No",

        // Posting & Work Details
        "Classes Taught": "9th,10th",
        "Periods Per Week": "24",
        "Multiple Subjects or Grades": "Yes",
        "Non-Teaching Duties": "No",
        "Non-Teaching Duties Details": "",

        // Salary & Employment
        "Salary Band": "Level 8",
        "Salary Payment Mode": "Bank Transfer",
        "Working Status": "Active",

        // Contact Information
        "Phone*": "+1234567890",
        "Email*": "john.doe@school.com",

        // Address
        Street: "123 Main St",
        City: "Anytown",
        State: "State",
        "Zip Code": "12345",
        Country: "India",
      },
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // First Name*
      { wch: 15 }, // Middle Name
      { wch: 15 }, // Last Name*
      { wch: 10 }, // Gender*
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // Social Category
      { wch: 15 }, // Disability Status
      { wch: 20 }, // Aadhaar Number
      { wch: 15 }, // Teacher Type
      { wch: 20 }, // Nature of Appointment
      { wch: 15 }, // Appointed Under
      { wch: 20 }, // Date of Joining Service
      { wch: 25 }, // Date of Joining Present School
      { wch: 25 }, // UDISE Code Previous School
      { wch: 25 }, // Highest Academic Qualification
      { wch: 25 }, // Highest Professional Qualification
      { wch: 30 }, // Subjects
      { wch: 20 }, // Medium of Instruction
      { wch: 15 }, // In-Service Training
      { wch: 15 }, // ICT Training
      { wch: 15 }, // FLN Training
      { wch: 25 }, // Inclusive Education Training
      { wch: 15 }, // Classes Taught
      { wch: 15 }, // Periods Per Week
      { wch: 25 }, // Multiple Subjects or Grades
      { wch: 20 }, // Non-Teaching Duties
      { wch: 25 }, // Non-Teaching Duties Details
      { wch: 15 }, // Salary Band
      { wch: 20 }, // Salary Payment Mode
      { wch: 15 }, // Working Status
      { wch: 15 }, // Phone*
      { wch: 25 }, // Email*
      { wch: 25 }, // Street
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }, // Zip Code
      { wch: 15 }, // Country
    ];
    worksheet["!cols"] = columnWidths;

    // Add color coding for required fields (red background for required fields)
    const requiredFields = ["First Name*", "Last Name*", "Gender*", "Phone*", "Email*"];

    // Apply red background to required field headers
    const range = xlsx.utils.decode_range(worksheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
      const cellValue = worksheet[cellAddress];
      if (cellValue && requiredFields.includes(cellValue.v)) {
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: "FFFF0000" }, // Red background
            patternType: "solid",
          },
          font: {
            color: { rgb: "FFFFFFFF" }, // White text
            bold: true,
          },
        };
      }
    }

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Teachers Template");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader("Content-Disposition", "attachment; filename=teachers_template.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel template:", error);
    res.status(500).json({
      success: false,
      message: "Error generating Excel template",
    });
  }
});

// @route   POST /api/users/bulk-upload
// @desc    Bulk upload teachers from Excel file
// @access  Private (Admin/Principal only)
router.post("/bulk-upload", auth, adminOrPrincipal, upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or invalid",
      });
    }

    const results = {
      successful: [],
      failed: [],
      duplicates: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Skip empty rows - using exact column names from template
        if (!row["First Name*"] || !row["Last Name*"] || !row["Email*"]) {
          results.failed.push({
            row: i + 2, // +2 because Excel is 1-indexed and has header
            data: row,
            error: "First Name, Last Name, and Email are required",
          });
          continue;
        }

        // Check for duplicates
        const existingUser = await User.findOne({ email: row["Email*"] });
        if (existingUser) {
          results.duplicates.push({
            row: i + 2,
            data: row,
            error: "Email already exists",
          });
          continue;
        }

        // Generate employee ID and temporary password
        const employeeId = `EMP${Date.now()}${i}`;
        const tempPassword = generateTempPassword();

        // Create teacher object with new field structure
        const teacherData = {
          firstName: row["First Name*"],
          middleName: row["Middle Name"] || "",
          lastName: row["Last Name*"],
          email: row["Email*"],
          password: tempPassword,
          role: "teacher",
          gender: row["Gender*"] || "",
          phone: row["Phone*"] || "",
          employeeId,
          status: "approved",
          approvedBy: req.user.id,
          approvedAt: new Date(),
        };

        // Add date of birth if provided
        if (row["Date of Birth"]) {
          teacherData.dateOfBirth = new Date(row["Date of Birth"]);
        }

        // Add additional fields
        if (row["Social Category"]) teacherData.socialCategory = row["Social Category"];
        if (row["Disability Status"]) teacherData.disabilityStatus = row["Disability Status"];
        if (row["Aadhaar Number"]) teacherData.aadhaarNumber = row["Aadhaar Number"];
        if (row["Teacher Type"]) teacherData.teacherType = row["Teacher Type"];
        if (row["Nature of Appointment"]) teacherData.natureOfAppointment = row["Nature of Appointment"];
        if (row["Appointed Under"]) teacherData.appointedUnder = row["Appointed Under"];
        if (row["Date of Joining Service"]) teacherData.dateOfJoiningService = new Date(row["Date of Joining Service"]);
        if (row["Date of Joining Present School"])
          teacherData.dateOfJoiningPresentSchool = new Date(row["Date of Joining Present School"]);
        if (row["UDISE Code Previous School"]) teacherData.udiseCodePreviousSchool = row["UDISE Code Previous School"];
        if (row["Highest Academic Qualification"])
          teacherData.highestAcademicQualification = row["Highest Academic Qualification"];
        if (row["Highest Professional Qualification"])
          teacherData.highestProfessionalQualification = row["Highest Professional Qualification"];
        if (row["Medium of Instruction"]) teacherData.mediumOfInstruction = row["Medium of Instruction"];
        if (row["Classes Taught"]) teacherData.classesTaught = row["Classes Taught"];
        if (row["Periods Per Week"]) teacherData.periodsPerWeek = parseInt(row["Periods Per Week"]) || 0;
        if (row["Salary Band"]) teacherData.salaryBand = row["Salary Band"];
        if (row["Salary Payment Mode"]) teacherData.salaryPaymentMode = row["Salary Payment Mode"];
        if (row["Working Status"]) teacherData.workingStatus = row["Working Status"];

        // Handle boolean fields
        if (row["In-Service Training"])
          teacherData.inServiceTraining = row["In-Service Training"].toLowerCase() === "yes";
        if (row["ICT Training"]) teacherData.ictTraining = row["ICT Training"].toLowerCase() === "yes";
        if (row["FLN Training"]) teacherData.flnTraining = row["FLN Training"].toLowerCase() === "yes";
        if (row["Inclusive Education Training"])
          teacherData.inclusiveEducationTraining = row["Inclusive Education Training"].toLowerCase() === "yes";
        if (row["Multiple Subjects or Grades"])
          teacherData.multipleSubjectsOrGrades = row["Multiple Subjects or Grades"].toLowerCase() === "yes";
        if (row["Non-Teaching Duties"])
          teacherData.nonTeachingDuties = row["Non-Teaching Duties"].toLowerCase() === "yes";
        if (row["Non-Teaching Duties Details"])
          teacherData.nonTeachingDutiesDetails = row["Non-Teaching Duties Details"];

        // Handle subjects (comma-separated list)
        if (row["Subjects"]) {
          // For bulk upload, we'll skip subjects for now to avoid ObjectId issues
          // Subjects can be added later through the edit form
        }

        // Add address if provided
        if (row["Street"] || row["City"] || row["State"] || row["Zip Code"] || row["Country"]) {
          teacherData.address = {
            street: row["Street"] || "",
            city: row["City"] || "",
            state: row["State"] || "",
            zipCode: row["Zip Code"] || "",
            country: row["Country"] || "",
          };
        }

        let teacher;
        try {
          teacher = await User.create(teacherData);
        } catch (createError) {
          throw createError;
        }

        results.successful.push({
          row: i + 2,
          teacher: {
            id: teacher._id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            employeeId: teacher.employeeId,
            tempPassword: tempPassword,
          },
        });
      } catch (error) {
        results.failed.push({
          row: i + 2,
          data: row,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} teachers created successfully.`,
      results,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    res.status(500).json({
      success: false,
      message: "Server error during bulk upload",
      error: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/Principal only)
router.get("/:id", auth, adminOrPrincipal, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("subjects", "name")
      .populate("class", "name grade section")
      .populate("approvedBy", "name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin/Principal only)
router.put("/:id", auth, adminOrPrincipal, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user permanently
// @access  Private (Admin/Principal only)
router.delete("/:id", auth, adminOrPrincipal, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
});

module.exports = router;
