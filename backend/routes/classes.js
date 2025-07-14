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
      isActive: true 
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
    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      mobileNumber, 
      rollNumber, 
      dateOfBirth, 
      gender,
      currentAddress,
      mothersName,
      parentsMobileNumber,
      address 
    } = req.body;

    // Check if class exists
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if class is full
    if (classData.currentStrength >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Class is at maximum capacity",
      });
    }

    // Check if student already exists with same email
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    // Check if roll number already exists in the class
    const existingRollNumber = await Student.findOne({ 
      class: req.params.id, 
      rollNumber: rollNumber 
    });
    if (existingRollNumber) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists in this class",
      });
    }

    // Generate student ID
    const studentId = generateStudentId();

    // Create student
    const student = await Student.create({
      firstName,
      middleName,
      lastName,
      email,
      mobileNumber,
      rollNumber,
      dateOfBirth,
      gender,
      currentAddress,
      mothersName,
      parentsMobileNumber,
      grade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
      class: req.params.id,
      academicYear: classData.academicYear,
      currentGrade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
      // Legacy fields for backward compatibility
      father: { 
        name: mothersName, 
        phone: parentsMobileNumber 
      },
      mother: { 
        name: mothersName, 
        phone: parentsMobileNumber 
      },
      address: { 
        street: currentAddress || "",
        city: "",
        state: "",
        country: "India"
      },
      createdBy: req.user.id,
    });

    // Add student to class
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
        FirstName: "John",
        MiddleName: "Michael",
        LastName: "Doe",
        Email: "john.doe@example.com",
        MobileNumber: "+1234567890",
        DateOfBirth: "2010-05-15",
        Gender: "male",
        CurrentAddress: "123 Main Street, City, State",
        MothersName: "Jane Doe",
        ParentsMobileNumber: "+1234567891",
        RollNumber: "001"
      }
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // FirstName
      { wch: 15 }, // MiddleName
      { wch: 15 }, // LastName
      { wch: 25 }, // Email
      { wch: 15 }, // MobileNumber
      { wch: 12 }, // DateOfBirth
      { wch: 10 }, // Gender
      { wch: 40 }, // CurrentAddress
      { wch: 20 }, // MothersName
      { wch: 15 }, // ParentsMobileNumber
      { wch: 10 }, // RollNumber
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Students Template");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="students_template_${classData.grade}${classData.division}.xlsx"`);
    
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
          rollNumber: row.RollNumber 
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
        const student = await Student.create({
          firstName: row.FirstName,
          middleName: row.MiddleName || "",
          lastName: row.LastName,
          email: row.Email,
          mobileNumber: row.MobileNumber || row.Phone || "",
          rollNumber: row.RollNumber,
          dateOfBirth: row.DateOfBirth || null,
          gender: row.Gender || "other",
          currentAddress: row.CurrentAddress || row.Address || "",
          mothersName: row.MothersName || row.ParentName || "",
          parentsMobileNumber: row.ParentsMobileNumber || row.ParentPhone || "",
          grade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
          class: req.params.id,
          academicYear: classData.academicYear,
          currentGrade: `${classData.grade}${classData.getOrdinalSuffix(classData.grade)}`,
          // Legacy fields for backward compatibility
          father: {
            name: row.MothersName || row.ParentName || "",
            phone: row.ParentsMobileNumber || row.ParentPhone || "",
          },
          mother: {
            name: row.MothersName || row.ParentName || "",
            phone: row.ParentsMobileNumber || row.ParentPhone || "",
          },
          address: {
            street: row.CurrentAddress || row.Address || "",
            city: row.City || "",
            state: row.State || "",
            zipCode: row.ZipCode || "",
            country: row.Country || "India",
          },
          createdBy: req.user.id,
        });

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
        select: "name code description"
      })
      .populate({
        path: "subjects.teacher",
        select: "name email"
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
    const subjectIndex = classData.subjects.findIndex(
      sub => sub.subject.toString() === req.params.subjectId
    );

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
