const express = require("express");
const router = express.Router();
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getTeacherAssignedSubjects,
  getTeacherTimetableSubjects,
  assignSubjectToTeacher,
} = require("../controllers/subjectController");
const { auth, authorize, teacherOnly } = require("../middleware/auth");

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get("/", auth, getAllSubjects);

// @route   GET /api/subjects/teacher/assigned
// @desc    Get teacher's assigned subjects
// @access  Private (Teacher only)
router.get("/teacher/assigned", auth, teacherOnly, getTeacherAssignedSubjects);

// @route   GET /api/subjects/teacher/timetable
// @desc    Get teacher's timetable subjects
// @access  Private (Teacher only)
router.get("/teacher/timetable", auth, teacherOnly, getTeacherTimetableSubjects);

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get("/:id", auth, getSubjectById);

// @route   POST /api/subjects
// @desc    Create subject
// @access  Private (Admin only)
router.post("/", auth, authorize("admin"), createSubject);

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin only)
router.put("/:id", auth, authorize("admin"), updateSubject);

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (Admin only)
router.delete("/:id", auth, authorize("admin"), deleteSubject);

// @route   PUT /api/subjects/:id/assign-teacher
// @desc    Assign subject to teacher
// @access  Private (Admin only)
router.put("/:id/assign-teacher", auth, authorize("admin"), assignSubjectToTeacher);

module.exports = router;
