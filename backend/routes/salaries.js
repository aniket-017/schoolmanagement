const express = require("express");
const router = express.Router();
const {
  createSalaryRecord,
  getSalaryRecords,
  getSalaryRecordById,
  getStaffSalaryHistory,
  updateSalaryRecord,
  updateSalaryStatus,
  deleteSalaryRecord,
  generatePayrollReport,
  getSalaryStats,
} = require("../controllers/salaryController.js");
const { auth } = require("../middleware/auth.js");

// Create salary record (admins and accountants)
router.post("/", auth, createSalaryRecord);

// Get all salary records with filters
router.get("/", auth, getSalaryRecords);

// Get salary record by ID
router.get("/:id", auth, getSalaryRecordById);

// Get staff salary history
router.get("/staff/:staff_id/history", auth, getStaffSalaryHistory);

// Generate payroll report
router.get("/report/payroll", auth, generatePayrollReport);

// Get salary statistics
router.get("/stats/overview", auth, getSalaryStats);

// Update salary record
router.put("/:id", auth, updateSalaryRecord);

// Update salary status
router.put("/:id/status", auth, updateSalaryStatus);

// Delete salary record
router.delete("/:id", auth, deleteSalaryRecord);

module.exports = router;
