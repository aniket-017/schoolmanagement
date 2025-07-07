const express = require("express");
const router = express.Router();
const {
  createTransport,
  getTransports,
  getTransportById,
  updateTransport,
  deleteTransport,
  assignStudentToTransport,
  getStudentTransportAssignments,
  updateStudentTransportAssignment,
  deactivateStudentTransportAssignment,
  getTransportStats,
} = require("../controllers/transportController.js");
const { auth } = require("../middleware/auth.js");

// Create transport route (admins)
router.post("/", auth, createTransport);

// Assign student to transport
router.post("/assign", auth, assignStudentToTransport);

// Get all transport routes with filters
router.get("/", auth, getTransports);

// Get transport route by ID
router.get("/:id", auth, getTransportById);

// Get student transport assignments
router.get("/assignments", auth, getStudentTransportAssignments);

// Get transport statistics
router.get("/stats/overview", auth, getTransportStats);

// Update transport route
router.put("/:id", auth, updateTransport);

// Update student transport assignment
router.put("/assignment/:id", auth, updateStudentTransportAssignment);

// Deactivate student transport assignment
router.put("/assignment/:id/deactivate", auth, deactivateStudentTransportAssignment);

// Delete transport route
router.delete("/:id", auth, deleteTransport);

module.exports = router;
