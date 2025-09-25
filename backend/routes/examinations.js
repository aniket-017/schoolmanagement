const express = require("express");
const router = express.Router();
const {
  createExamination,
  getExaminations,
  getExaminationsGrouped,
  getExaminationById,
  getExaminationsByClass,
  getExaminationsBySubject,
  updateExamination,
  deleteExamination,
  updateExaminationStatus,
  getExaminationStats,
  getExaminationResults,
} = require("../controllers/examinationController.js");
const { auth } = require("../middleware/auth.js");

// Create examination (admins and teachers)
router.post("/", auth, createExamination);

// Get all examinations with filters
router.get("/", auth, getExaminations);

// Get examinations grouped by name
router.get("/grouped", auth, getExaminationsGrouped);

// Get examination by ID
router.get("/:id", auth, getExaminationById);

// Get examination results
router.get("/:id/results", auth, getExaminationResults);

// Get examinations by class
router.get("/class/:classId", auth, getExaminationsByClass);

// Get examinations by subject
router.get("/subject/:subjectId", auth, getExaminationsBySubject);

// Get examination statistics
router.get("/stats/overview", auth, getExaminationStats);

// Debug endpoint to check exams
router.get("/debug/all", auth, async (req, res) => {
  try {
    const Examination = require("../models/Examination");
    const allExams = await Examination.find({}).limit(10);
    const totalCount = await Examination.countDocuments({});
    
    res.json({
      success: true,
      totalCount,
      sampleExams: allExams.map(exam => ({
        _id: exam._id,
        name: exam.name,
        type: exam.type,
        classId: exam.classId,
        isActive: exam.isActive,
        status: exam.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching debug info",
      error: error.message
    });
  }
});

// Update examination
router.put("/:id", auth, updateExamination);

// Update examination status
router.put("/:id/status", auth, updateExaminationStatus);

// Delete examination
router.delete("/:id", auth, deleteExamination);

module.exports = router;
