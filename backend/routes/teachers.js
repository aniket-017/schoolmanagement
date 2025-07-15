const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { auth, authorize } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(auth);

// Debug route to check current user
router.get("/debug/user", (req, res) => {
  res.json({
    success: true,
    user: req.user,
    role: req.user?.role,
    isActive: req.user?.isActive,
    status: req.user?.status,
  });
});

// Get all teachers with lecture information (Admin, Principal)
router.get("/", authorize(["admin", "principal"]), teacherController.getAllTeachers);

// Get teacher availability for specific time slot (All authenticated users)
router.get("/availability/check", teacherController.getTeacherAvailability);

// Get all available teachers for a subject (All authenticated users)
router.get("/availability/subject", teacherController.getAvailableTeachersForSubject);

// Get teacher workload statistics (Admin, Principal, Teacher)
router.get("/:teacherId/workload", authorize(["admin", "principal", "teacher"]), teacherController.getTeacherWorkload);

// Get teacher by ID with detailed information (Admin, Principal, Teacher)
router.get("/:id", authorize(["admin", "principal", "teacher"]), teacherController.getTeacherById);

// Update teacher lecture schedule (Admin, Principal)
router.put("/:id/schedule", authorize(["admin", "principal"]), teacherController.updateTeacherSchedule);

module.exports = router;
