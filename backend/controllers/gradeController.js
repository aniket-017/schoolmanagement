const Grade = require("../models/Grade");
const Examination = require("../models/Examination");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Create a new grade entry
exports.createGrade = async (req, res) => {
  try {
    const { student_id, examination_id, marks_obtained, remarks, graded_by } = req.body;

    // Validate required fields
    if (!student_id || !examination_id || marks_obtained === undefined) {
      return res.status(400).json({
        success: false,
        message: "Student ID, examination ID, and marks obtained are required",
      });
    }

    // Check if examination exists
    const examination = await Examination.findById(examination_id);
    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    // Check if student exists
    const student = await User.findById(student_id);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if grade already exists for this student and examination
    const existingGrade = await Grade.findOne({
      student_id,
      examination_id,
    });

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: "Grade already exists for this student and examination",
      });
    }

    // Validate marks
    if (marks_obtained < 0 || marks_obtained > examination.total_marks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${examination.total_marks}`,
      });
    }

    const grade = new Grade({
      student_id,
      examination_id,
      marks_obtained,
      remarks,
      graded_by: graded_by || req.user.id,
    });

    await grade.save();
    await grade.populate(["student_id", "examination_id", "graded_by"]);

    res.status(201).json({
      success: true,
      message: "Grade created successfully",
      data: grade,
    });
  } catch (error) {
    console.error("Error creating grade:", error);
    res.status(500).json({
      success: false,
      message: "Error creating grade",
      error: error.message,
    });
  }
};

// Get all grades with filters
exports.getGrades = async (req, res) => {
  try {
    const { student_id, examination_id, class_id, subject_id, is_pass, page = 1, limit = 10 } = req.query;

    let query = {};

    // Build basic query filters
    if (student_id) query.student_id = student_id;
    if (examination_id) query.examination_id = examination_id;
    if (is_pass !== undefined) query.is_pass = is_pass === "true";

    // For class and subject filters, we need to join with examinations
    let matchStage = {};
    if (class_id) matchStage["examination.class_id"] = class_id;
    if (subject_id) matchStage["examination.subject_id"] = subject_id;

    const skip = (page - 1) * limit;

    let aggregationPipeline = [
      {
        $lookup: {
          from: "examinations",
          localField: "examination_id",
          foreignField: "_id",
          as: "examination",
        },
      },
      { $unwind: "$examination" },
    ];

    // Add match stage if we have class or subject filters
    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }

    // Add other filters
    if (Object.keys(query).length > 0) {
      aggregationPipeline.push({ $match: query });
    }

    // Add population stages
    aggregationPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "users",
          localField: "graded_by",
          foreignField: "_id",
          as: "grader",
        },
      },
      { $unwind: { path: "$grader", preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const grades = await Grade.aggregate(aggregationPipeline);

    // Get total count for pagination
    const countPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
    const totalGrades = await Grade.aggregate([...countPipeline, { $count: "total" }]);
    const total = totalGrades.length > 0 ? totalGrades[0].total : 0;

    res.json({
      success: true,
      data: grades,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grades",
      error: error.message,
    });
  }
};

// Get grade by ID
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("student_id", "name email roll_number")
      .populate("examination_id")
      .populate("graded_by", "name email");

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    console.error("Error fetching grade:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grade",
      error: error.message,
    });
  }
};

// Get student grades
exports.getStudentGrades = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { subject_id, class_id } = req.query;

    // Build match criteria for examinations
    let examMatch = {};
    if (subject_id) examMatch.subject_id = subject_id;
    if (class_id) examMatch.class_id = class_id;

    const aggregationPipeline = [
      { $match: { student_id: student_id } },
      {
        $lookup: {
          from: "examinations",
          localField: "examination_id",
          foreignField: "_id",
          as: "examination",
        },
      },
      { $unwind: "$examination" },
    ];

    if (Object.keys(examMatch).length > 0) {
      aggregationPipeline.push({ $match: examMatch });
    }

    aggregationPipeline.push(
      {
        $lookup: {
          from: "subjects",
          localField: "examination.subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $lookup: {
          from: "classes",
          localField: "examination.class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: "$class" },
      { $sort: { "examination.exam_date": -1 } }
    );

    const grades = await Grade.aggregate(aggregationPipeline);

    // Calculate summary statistics
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks_obtained, 0);
    const totalPossible = grades.reduce((sum, grade) => sum + grade.examination.total_marks, 0);
    const passedExams = grades.filter((grade) => grade.is_pass).length;
    const averagePercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        grades,
        summary: {
          total_exams: grades.length,
          passed_exams: passedExams,
          total_marks: totalMarks,
          total_possible: totalPossible,
          average_percentage: averagePercentage,
          pass_rate: grades.length > 0 ? ((passedExams / grades.length) * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student grades",
      error: error.message,
    });
  }
};

// Get class grades for an examination
exports.getClassGrades = async (req, res) => {
  try {
    const { examination_id } = req.params;

    const examination = await Examination.findById(examination_id)
      .populate("class_id", "name section")
      .populate("subject_id", "name code");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    const grades = await Grade.find({ examination_id })
      .populate("student_id", "name email roll_number")
      .populate("graded_by", "name email")
      .sort({ marks_obtained: -1 });

    // Calculate class statistics
    const totalStudents = grades.length;
    const passedStudents = grades.filter((grade) => grade.is_pass).length;
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks_obtained, 0);
    const averageMarks = totalStudents > 0 ? (totalMarks / totalStudents).toFixed(2) : 0;
    const highestMarks = grades.length > 0 ? grades[0].marks_obtained : 0;
    const lowestMarks = grades.length > 0 ? grades[grades.length - 1].marks_obtained : 0;

    res.json({
      success: true,
      data: {
        examination,
        grades,
        statistics: {
          total_students: totalStudents,
          passed_students: passedStudents,
          failed_students: totalStudents - passedStudents,
          pass_percentage: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0,
          average_marks: averageMarks,
          highest_marks: highestMarks,
          lowest_marks: lowestMarks,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching class grades:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class grades",
      error: error.message,
    });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, remarks } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    // Get examination details for validation
    const examination = await Examination.findById(grade.examination_id);
    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Associated examination not found",
      });
    }

    // Validate marks if provided
    if (marks_obtained !== undefined) {
      if (marks_obtained < 0 || marks_obtained > examination.total_marks) {
        return res.status(400).json({
          success: false,
          message: `Marks must be between 0 and ${examination.total_marks}`,
        });
      }
    }

    const updateData = {};
    if (marks_obtained !== undefined) updateData.marks_obtained = marks_obtained;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updatedGrade = await Grade.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate([
      "student_id",
      "examination_id",
      "graded_by",
    ]);

    res.json({
      success: true,
      message: "Grade updated successfully",
      data: updatedGrade,
    });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({
      success: false,
      message: "Error updating grade",
      error: error.message,
    });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    res.json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting grade",
      error: error.message,
    });
  }
};

// Bulk create grades
exports.bulkCreateGrades = async (req, res) => {
  try {
    const { examination_id, grades } = req.body;

    if (!examination_id || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Examination ID and grades array are required",
      });
    }

    // Check if examination exists
    const examination = await Examination.findById(examination_id);
    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    // Validate and prepare grades
    const gradePromises = grades.map(async (gradeData) => {
      const { student_id, marks_obtained, remarks } = gradeData;

      // Validate marks
      if (marks_obtained < 0 || marks_obtained > examination.total_marks) {
        throw new Error(`Invalid marks for student ${student_id}: must be between 0 and ${examination.total_marks}`);
      }

      // Check if grade already exists
      const existingGrade = await Grade.findOne({
        student_id,
        examination_id,
      });

      if (existingGrade) {
        throw new Error(`Grade already exists for student ${student_id}`);
      }

      return new Grade({
        student_id,
        examination_id,
        marks_obtained,
        remarks,
        graded_by: req.user.id,
      });
    });

    const gradesToCreate = await Promise.all(gradePromises);
    const createdGrades = await Grade.insertMany(gradesToCreate);

    res.status(201).json({
      success: true,
      message: `${createdGrades.length} grades created successfully`,
      data: createdGrades,
    });
  } catch (error) {
    console.error("Error bulk creating grades:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk creating grades",
      error: error.message,
    });
  }
};

// Get grade statistics
exports.getGradeStats = async (req, res) => {
  try {
    const totalGrades = await Grade.countDocuments();
    const passedGrades = await Grade.countDocuments({ is_pass: true });
    const failedGrades = await Grade.countDocuments({ is_pass: false });

    // Grade distribution
    const gradeDistribution = await Grade.aggregate([
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 35, 50, 60, 75, 90, 100],
          default: "Other",
          output: {
            count: { $sum: 1 },
            grades: { $push: "$percentage" },
          },
        },
      },
    ]);

    // Top performing students
    const topStudents = await Grade.aggregate([
      {
        $group: {
          _id: "$student_id",
          total_marks: { $sum: "$marks_obtained" },
          total_possible: { $sum: "$total_marks" },
          avg_percentage: { $avg: "$percentage" },
          exams_count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $sort: { avg_percentage: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total_grades: totalGrades,
        passed_grades: passedGrades,
        failed_grades: failedGrades,
        pass_percentage: totalGrades > 0 ? ((passedGrades / totalGrades) * 100).toFixed(2) : 0,
        grade_distribution: gradeDistribution,
        top_students: topStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching grade statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grade statistics",
      error: error.message,
    });
  }
};
