const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getAnnouncementsForUser,
  getAnnouncementsByClass,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getAnnouncementReadStatus,
  getAnnouncementStats,
} = require("../controllers/announcementController");
const { auth } = require("../middleware/auth");

// Create announcement (admins and principals)
router.post("/", auth, createAnnouncement);

// Get all announcements with filters
router.get("/", auth, getAnnouncements);

// Get announcement by ID
router.get("/:id", auth, getAnnouncementById);

// Get announcement read status
router.get("/:id/read-status", auth, getAnnouncementReadStatus);

// Get announcements for a specific user
router.get("/user/:user_id", auth, getAnnouncementsForUser);

// Get announcements by class
router.get("/class/:class_id", auth, getAnnouncementsByClass);

// Get announcement statistics
router.get("/stats/overview", auth, getAnnouncementStats);

// Update announcement
router.put("/:id", auth, updateAnnouncement);

// Update announcement status
router.put("/:id/status", auth, updateAnnouncementStatus);

// Mark announcement as read
router.put("/:id/read", auth, markAnnouncementAsRead);

// Delete announcement
router.delete("/:id", auth, deleteAnnouncement);

module.exports = router;
