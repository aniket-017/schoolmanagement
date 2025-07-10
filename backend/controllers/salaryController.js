const StaffSalary = require("../models/StaffSalary");
const User = require("../models/User");

// Create a new salary record
exports.createSalaryRecord = async (req, res) => {
  try {
    const { staff_id, month, year, basic_salary, allowances, deductions, overtime_hours, overtime_rate, bonus, notes } =
      req.body;

    // Validate required fields
    if (!staff_id || !month || !year || !basic_salary) {
      return res.status(400).json({
        success: false,
        message: "Staff ID, month, year, and basic salary are required",
      });
    }

    // Validate staff exists
    const staff = await User.findById(staff_id);
    if (!staff || !["teacher", "admin", "principal", "cleaner", "bus_driver", "accountant"].includes(staff.role)) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Check if salary record already exists for this month/year
    const existingSalary = await StaffSalary.findOne({
      staff_id,
      month,
      year,
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary record already exists for this month and year",
      });
    }

    const salaryRecord = new StaffSalary({
      staff_id,
      month,
      year,
      basic_salary,
      allowances: allowances || [],
      deductions: deductions || [],
      overtime_hours: overtime_hours || 0,
      overtime_rate: overtime_rate || 0,
      bonus: bonus || 0,
      notes,
      created_by: req.user.id,
    });

    await salaryRecord.save();
    await salaryRecord.populate(["staff_id", "created_by"]);

    res.status(201).json({
      success: true,
      message: "Salary record created successfully",
      data: salaryRecord,
    });
  } catch (error) {
    console.error("Error creating salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error creating salary record",
      error: error.message,
    });
  }
};

// Get all salary records with filters
exports.getSalaryRecords = async (req, res) => {
  try {
    const { staff_id, month, year, status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Build query filters
    if (staff_id) query.staff_id = staff_id;
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    // Join with users to get staff information
    let aggregationPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: "$staff" },
    ];

    // Add other filters
    if (Object.keys(query).length > 0) {
      aggregationPipeline.push({ $match: query });
    }

    // Add additional lookups and sorting
    aggregationPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
      { $sort: { year: -1, month: -1, created_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const salaryRecords = await StaffSalary.aggregate(aggregationPipeline);

    // Get total count for pagination
    const countPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
    const totalRecords = await StaffSalary.aggregate([...countPipeline, { $count: "total" }]);
    const total = totalRecords.length > 0 ? totalRecords[0].total : 0;

    res.json({
      success: true,
      data: salaryRecords,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching salary records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      error: error.message,
    });
  }
};

// Get salary record by ID
exports.getSalaryRecordById = async (req, res) => {
  try {
    const salaryRecord = await StaffSalary.findById(req.params.id)
      .populate("staff_id", "name email role")
      .populate("created_by", "name email");

    if (!salaryRecord) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: salaryRecord,
    });
  } catch (error) {
    console.error("Error fetching salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary record",
      error: error.message,
    });
  }
};

// Get staff salary history
exports.getStaffSalaryHistory = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { year, page = 1, limit = 12 } = req.query;

    const query = { staff_id };
    if (year) query.year = year;

    const skip = (page - 1) * limit;

    const salaryHistory = await StaffSalary.find(query)
      .populate("created_by", "name email")
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StaffSalary.countDocuments(query);

    // Calculate yearly totals if year is specified
    let yearlyTotals = null;
    if (year) {
      const yearlyData = await StaffSalary.aggregate([
        { $match: { staff_id: staff_id, year: parseInt(year) } },
        {
          $group: {
            _id: null,
            total_basic: { $sum: "$basic_salary" },
            total_allowances: { $sum: "$total_allowances" },
            total_deductions: { $sum: "$total_deductions" },
            total_overtime: { $sum: "$overtime_amount" },
            total_bonus: { $sum: "$bonus" },
            total_gross: { $sum: "$gross_salary" },
            total_net: { $sum: "$net_salary" },
            months_paid: { $sum: 1 },
          },
        },
      ]);

      yearlyTotals = yearlyData.length > 0 ? yearlyData[0] : null;
    }

    res.json({
      success: true,
      data: {
        salary_history: salaryHistory,
        yearly_totals: yearlyTotals,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching staff salary history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff salary history",
      error: error.message,
    });
  }
};

// Update salary record
exports.updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.staff_id;
    delete updateData.month;
    delete updateData.year;
    delete updateData.created_by;

    const salaryRecord = await StaffSalary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["staff_id", "created_by"]);

    if (!salaryRecord) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      message: "Salary record updated successfully",
      data: salaryRecord,
    });
  } catch (error) {
    console.error("Error updating salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error updating salary record",
      error: error.message,
    });
  }
};

// Update salary status
exports.updateSalaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "paid", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, approved, paid, cancelled",
      });
    }

    const updateData = { status };
    if (status === "paid") {
      updateData.paid_date = new Date();
    }

    const salaryRecord = await StaffSalary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["staff_id", "created_by"]);

    if (!salaryRecord) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      message: "Salary status updated successfully",
      data: salaryRecord,
    });
  } catch (error) {
    console.error("Error updating salary status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating salary status",
      error: error.message,
    });
  }
};

// Delete salary record
exports.deleteSalaryRecord = async (req, res) => {
  try {
    const salaryRecord = await StaffSalary.findByIdAndDelete(req.params.id);

    if (!salaryRecord) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting salary record",
      error: error.message,
    });
  }
};

// Generate payroll report
exports.generatePayrollReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    let matchStage = {
      month: parseInt(month),
      year: parseInt(year),
    };

    let aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: "$staff" },
    ];

    aggregationPipeline.push({
      $group: {
        _id: null,
        total_staff: { $sum: 1 },
        total_basic_salary: { $sum: "$basic_salary" },
        total_allowances: { $sum: "$total_allowances" },
        total_deductions: { $sum: "$total_deductions" },
        total_overtime: { $sum: "$overtime_amount" },
        total_bonus: { $sum: "$bonus" },
        total_gross_salary: { $sum: "$gross_salary" },
        total_net_salary: { $sum: "$net_salary" },
        records: { $push: "$$ROOT" },
      },
    });

    const reportData = await StaffSalary.aggregate(aggregationPipeline);

    if (reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salary records found for the specified period",
      });
    }

    const report = reportData[0];

    // Get status breakdown
    const statusBreakdown = await StaffSalary.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 }, total_amount: { $sum: "$net_salary" } } },
    ]);

    res.json({
      success: true,
      data: {
        period: `${month}/${year}`,
        summary: {
          total_staff: report.total_staff,
          total_basic_salary: report.total_basic_salary,
          total_allowances: report.total_allowances,
          total_deductions: report.total_deductions,
          total_overtime: report.total_overtime,
          total_bonus: report.total_bonus,
          total_gross_salary: report.total_gross_salary,
          total_net_salary: report.total_net_salary,
        },
        status_breakdown: statusBreakdown,
        detailed_records: report.records,
      },
    });
  } catch (error) {
    console.error("Error generating payroll report:", error);
    res.status(500).json({
      success: false,
      message: "Error generating payroll report",
      error: error.message,
    });
  }
};

// Get salary statistics
exports.getSalaryStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const totalRecords = await StaffSalary.countDocuments();
    const currentMonthRecords = await StaffSalary.countDocuments({
      month: currentMonth,
      year: currentYear,
    });

    const statusDistribution = await StaffSalary.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const monthlyTrends = await StaffSalary.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          total_salary: { $sum: "$net_salary" },
          staff_count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        total_records: totalRecords,
        current_month_records: currentMonthRecords,
        status_distribution: statusDistribution,

        monthly_trends: monthlyTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching salary statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary statistics",
      error: error.message,
    });
  }
};
