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
      subjectsSpecializedIn,
      mediumOfInstruction,
      inServiceTraining,
      ictTraining,
      flnTraining,
      inclusiveEducationTraining,
      classesTaught,
      subjectsTaught,
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
      subjectsSpecializedIn,
      mediumOfInstruction,
      inServiceTraining,
      ictTraining,
      flnTraining,
      inclusiveEducationTraining,
      classesTaught,
      subjectsTaught,
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
      // Set 'subjects' for compatibility with user list rendering
      subjects: subjectsTaught,
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
    // Define the template structure with exact column names
    const templateData = [
      {
        Name: "John Doe",
        Email: "john.doe@school.com",
        Phone: "+1234567890",
        Qualification: "M.Sc Mathematics",
        Experience: 5,
        "Date of Birth": "1990-01-15",
        Salary: 50000,
        Street: "123 Main St",
        City: "Anytown",
        State: "State",
        "Zip Code": "12345",
        Country: "Country",
      },
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Department
      { wch: 25 }, // Qualification
      { wch: 10 }, // Experience
      { wch: 15 }, // Date of Birth
      { wch: 10 }, // Salary
      { wch: 25 }, // Street
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }, // Zip Code
      { wch: 15 }, // Country
    ];
    worksheet["!cols"] = columnWidths;

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
        if (!row.Name || !row.Email) {
          results.failed.push({
            row: i + 2, // +2 because Excel is 1-indexed and has header
            data: row,
            error: "Name and email are required",
          });
          continue;
        }

        // Check for duplicates
        const existingUser = await User.findOne({ email: row.Email });
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

        // Create teacher object
        const teacherData = {
          name: row.Name,
          email: row.Email,
          password: tempPassword,
          role: "teacher",
          phone: row.Phone || "",
          qualification: row.Qualification || "",
          experience: row.Experience || 0,
          salary: row.Salary || 0,
          employeeId,
          status: "approved",
          approvedBy: req.user.id,
          approvedAt: new Date(),
        };

        // Add date of birth if provided
        if (row["Date of Birth"]) {
          teacherData.dateOfBirth = new Date(row["Date of Birth"]);
        }

        // Add address if provided
        if (row.Street || row.City || row.State || row["Zip Code"] || row.Country) {
          teacherData.address = {
            street: row.Street || "",
            city: row.City || "",
            state: row.State || "",
            zipCode: row["Zip Code"] || "",
            country: row.Country || "",
          };
        }

        const teacher = await User.create(teacherData);

        results.successful.push({
          row: i + 2,
          teacher: {
            id: teacher._id,
            name: teacher.name,
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

    // For teachers, ensure subjects field is synchronized with subjectsTaught
    if (updateData.subjectsTaught) {
      // First check if the user is a teacher
      const existingUser = await User.findById(req.params.id);
      if (existingUser && existingUser.role === "teacher") {
        updateData.subjects = updateData.subjectsTaught;
      }
    }

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
// @desc    Delete user (soft delete - deactivate)
// @access  Private (Admin/Principal only)
router.delete("/:id", auth, adminOrPrincipal, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      user,
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
