const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getAnnouncementsForUser,
  getTeacherAnnouncements,
  getAnnouncementsByClass,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getAnnouncementReadStatus,
  getAnnouncementStats,
  toggleAnnouncementPin,
  getUsersForTargeting,
  getAnnouncementsForStudent,
} = require("../controllers/announcementController");
const { auth } = require("../middleware/auth");

// Create announcement (admins and principals)
router.post("/", auth, createAnnouncement);

// Get all announcements with filters
router.get("/", auth, getAnnouncements);

// Get announcement statistics (must come before /:id routes)
router.get("/stats/overview", auth, getAnnouncementStats);

// Get users for individual targeting (must come before /:id routes)
router.get("/users/targeting", auth, getUsersForTargeting);

// Get announcements for a specific user (must come before /:id routes)
router.get("/user/:userId", auth, getAnnouncementsForUser);

// Get announcements for teachers (must come before /:id routes)
router.get("/teachers", auth, getTeacherAnnouncements);

// Get announcements by class (must come before /:id routes)
router.get("/class/:classId", auth, getAnnouncementsByClass);

// Get announcements for a specific student (Student collection)
router.get("/student/:studentId", auth, getAnnouncementsForStudent);

// Get announcement read status (must come before /:id routes)
router.get("/:id/read-status", auth, getAnnouncementReadStatus);

// Get announcement by ID (must come last among GET routes)
router.get("/:id", auth, getAnnouncementById);

// Update announcement
router.put("/:id", auth, updateAnnouncement);

// Update announcement status
router.put("/:id/status", auth, updateAnnouncementStatus);

// Toggle announcement pin status
router.put("/:id/pin", auth, toggleAnnouncementPin);

// Mark announcement as read
router.put("/:id/read", auth, markAnnouncementAsRead);

// Delete announcement
router.delete("/:id", auth, deleteAnnouncement);

module.exports = router;
