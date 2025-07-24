const express = require("express");
const router = express.Router();
const annualCalendarController = require("../controllers/annualCalendarController");
const { auth, authorize } = require("../middleware/auth");

// Admin routes (CRUD)
router.post("/", auth, authorize("admin"), annualCalendarController.createEvent);
router.put("/:id", auth, authorize("admin"), annualCalendarController.updateEvent);
router.delete("/:id", auth, authorize("admin"), annualCalendarController.deleteEvent);

// Public (students/teachers) - read only
router.get("/", auth, authorize("admin", "teacher", "student"), annualCalendarController.getAllEvents);
router.get("/:id", auth, authorize("admin", "teacher", "student"), annualCalendarController.getEventById);

module.exports = router; 