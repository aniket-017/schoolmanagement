const Fee = require("../models/Fee");
const User = require("../models/User");

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin only)
const createFee = async (req, res) => {
  try {
    const { studentId, feeType, amount, dueDate, academicYear, semester, month, discount, remarks } = req.body;

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const fee = await Fee.create({
      studentId,
      feeType,
      amount,
      dueDate,
      academicYear,
      semester,
      month,
      discount: discount || 0,
      remarks,
      processedBy: req.user.id,
    });

    await fee.populate("studentId", "name studentId");

    res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      data: fee,
    });
  } catch (error) {
    console.error("Create fee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating fee record",
    });
  }
};

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private (Admin only)
const getAllFees = async (req, res) => {
  try {
    const { status, feeType, academicYear, month, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (feeType) filter.feeType = feeType;
    if (academicYear) filter.academicYear = academicYear;
    if (month) filter.month = month;

    const skip = (page - 1) * limit;

    const fees = await Fee.find(filter)
      .populate("studentId", "name studentId class")
      .populate("processedBy", "name")
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalFees = await Fee.countDocuments(filter);

    res.json({
      success: true,
      count: fees.length,
      total: totalFees,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFees / limit),
      data: fees,
    });
  } catch (error) {
    console.error("Get all fees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fees",
    });
  }
};

// @desc    Get student fees
// @route   GET /api/fees/student/:studentId
// @access  Private
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, academicYear } = req.query;

    // Check if user is authorized to view this student's fees
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const filter = { studentId };
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter)
      .populate("studentId", "name studentId")
      .populate("processedBy", "name")
      .sort({ dueDate: -1 });

    // Calculate fee statistics
    const totalFees = fees.length;
    const paidFees = fees.filter((f) => f.status === "paid").length;
    const pendingFees = fees.filter((f) => f.status === "pending").length;
    const overdueFees = fees.filter((f) => f.status === "overdue").length;

    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const pendingAmount = totalAmount - paidAmount;

    res.json({
      success: true,
      data: {
        fees,
        statistics: {
          totalFees,
          paidFees,
          pendingFees,
          overdueFees,
          totalAmount,
          paidAmount,
          pendingAmount,
        },
      },
    });
  } catch (error) {
    console.error("Get student fees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student fees",
    });
  }
};

// @desc    Process fee payment
// @route   PUT /api/fees/:id/pay
// @access  Private
const processFeePayment = async (req, res) => {
  try {
    const { paidAmount, paymentMethod, transactionId, remarks } = req.body;

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    // Check if user is authorized to pay this fee
    if (req.user.role === "student" && req.user.id !== fee.studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Calculate remaining balance
    const remainingBalance = fee.amount - fee.paidAmount + fee.penalty - fee.discount;

    if (paidAmount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining balance",
      });
    }

    // Update fee record
    fee.paidAmount += paidAmount;
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.remarks = remarks;
    fee.processedBy = req.user.id;

    if (fee.paidAmount >= fee.amount) {
      fee.paidDate = new Date();
    }

    await fee.save();

    await fee.populate("studentId", "name studentId");

    res.json({
      success: true,
      message: "Payment processed successfully",
      data: fee,
    });
  } catch (error) {
    console.error("Process fee payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment",
    });
  }
};

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Private (Admin only)
const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, processedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate("studentId", "name studentId")
      .populate("processedBy", "name");

    res.json({
      success: true,
      message: "Fee record updated successfully",
      data: updatedFee,
    });
  } catch (error) {
    console.error("Update fee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating fee record",
    });
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (Admin only)
const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    await Fee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Fee record deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting fee record",
    });
  }
};

// @desc    Get fee statistics
// @route   GET /api/fees/stats
// @access  Private (Admin only)
const getFeeStats = async (req, res) => {
  try {
    const { academicYear, month } = req.query;

    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (month) filter.month = month;

    const stats = await Fee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          paidAmount: { $sum: "$paidAmount" },
        },
      },
    ]);

    const totalFees = await Fee.countDocuments(filter);
    const totalAmount = await Fee.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaidAmount = await Fee.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    const formattedStats = {
      totalFees,
      totalAmount: totalAmount[0]?.total || 0,
      totalPaidAmount: totalPaidAmount[0]?.total || 0,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      paid: stats.find((s) => s._id === "paid")?.count || 0,
      overdue: stats.find((s) => s._id === "overdue")?.count || 0,
      partial: stats.find((s) => s._id === "partial")?.count || 0,
    };

    formattedStats.collectionPercentage =
      formattedStats.totalAmount > 0
        ? ((formattedStats.totalPaidAmount / formattedStats.totalAmount) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Get fee stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee statistics",
    });
  }
};

// @desc    Get class fee status
// @route   GET /api/fees/class/:classId/status
// @access  Private (Admin only)
const getClassFeeStatus = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear, month } = req.query;

    console.log("Getting fee status for class:", classId);

    // Get all students in the class
    const User = require("../models/User");
    const Student = require("../models/Student");
    
    // First try to find students in User model
    let students = await User.find({ 
      class: classId, 
      role: "student",
      isActive: { $ne: false }
    });
    
    console.log("Found students in User model:", students.length);
    
    // If no students found in User model, try Student model
    if (students.length === 0) {
      students = await Student.find({
        class: classId,
        isActive: { $ne: false }
      });
      console.log("Found students in Student model:", students.length);
    }
    
    console.log("Total students found:", students.length);

    if (!students.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const studentIds = students.map(student => student._id);

    // Get fee information for all students in the class
    let feeFilter = { studentId: { $in: studentIds } };
    if (academicYear) feeFilter.academicYear = academicYear;
    if (month) feeFilter.month = month;

    const fees = await Fee.find(feeFilter)
      .populate("studentId", "name studentId rollNumber")
      .sort({ dueDate: 1 });

    // Group fees by student
    const studentFeeStatus = {};
    students.forEach(student => {
      studentFeeStatus[student._id.toString()] = {
        student: {
          _id: student._id,
          name: student.name || `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
          studentId: student.studentId,
          rollNumber: student.studentId, // Use studentId as rollNumber since User model doesn't have rollNumber
        },
        fees: [],
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        status: "no_fees", // default status
      };
    });

    // Process fee data
    fees.forEach(fee => {
      const studentId = fee.studentId._id.toString();
      if (studentFeeStatus[studentId]) {
        studentFeeStatus[studentId].fees.push(fee);
        studentFeeStatus[studentId].totalAmount += fee.amount;
        studentFeeStatus[studentId].paidAmount += fee.paidAmount || 0;
        studentFeeStatus[studentId].pendingAmount = studentFeeStatus[studentId].totalAmount - studentFeeStatus[studentId].paidAmount;
        
        // Determine overall status
        if (fee.status === "overdue") {
          studentFeeStatus[studentId].status = "overdue";
        } else if (fee.status === "pending" && studentFeeStatus[studentId].status !== "overdue") {
          studentFeeStatus[studentId].status = "pending";
        } else if (fee.status === "paid" && studentFeeStatus[studentId].status === "no_fees") {
          studentFeeStatus[studentId].status = "paid";
        } else if (fee.status === "partial" && studentFeeStatus[studentId].status === "no_fees") {
          studentFeeStatus[studentId].status = "partial";
        }
      }
    });

    const result = Object.values(studentFeeStatus);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get class fee status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching class fee status",
    });
  }
};

// @desc    Create fees for all students in a class
// @route   POST /api/fees/class/:classId
// @access  Private (Admin only)
const createClassFees = async (req, res) => {
  try {
    const { classId } = req.params;
    const { feeType, amount, dueDate, academicYear, remarks } = req.body;

    if (!feeType || !amount || !dueDate || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Fee type, amount, due date, and academic year are required",
      });
    }

    // Get all students in the class
    const User = require("../models/User");
    const Student = require("../models/Student");
    
    // First try to find students in User model
    let students = await User.find({ 
      class: classId, 
      role: "student",
      isActive: { $ne: false }
    });
    
    // If no students found in User model, try Student model
    if (students.length === 0) {
      students = await Student.find({
        class: classId,
        isActive: { $ne: false }
      });
    }

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in this class",
      });
    }

    // Create fees for all students
    const createdFees = [];
    for (const student of students) {
      const fee = await Fee.create({
        studentId: student._id,
        feeType,
        amount,
        dueDate: new Date(dueDate),
        academicYear,
        remarks: remarks || `Fee created for ${student.name || student.firstName} ${student.lastName}`,
        processedBy: req.user.id,
      });
      createdFees.push(fee);
    }

    res.status(201).json({
      success: true,
      message: `Fee records created for ${createdFees.length} students`,
      data: {
        createdCount: createdFees.length,
        fees: createdFees,
      },
    });
  } catch (error) {
    console.error("Create class fees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating class fees",
    });
  }
};

// @desc    Update fee status (mark as paid/remaining)
// @route   PUT /api/fees/:feeId/status
// @access  Private (Admin only)
const updateFeeStatus = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { status, paidAmount, paymentMethod, transactionId, remarks } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const updateData = { status };
    
    if (status === "paid") {
      updateData.paidAmount = paidAmount || fee.amount;
      updateData.paidDate = new Date();
      updateData.paymentMethod = paymentMethod;
      updateData.transactionId = transactionId;
    } else if (status === "partial") {
      updateData.paidAmount = paidAmount || 0;
      updateData.paidDate = new Date();
      updateData.paymentMethod = paymentMethod;
      updateData.transactionId = transactionId;
    }

    if (remarks) {
      updateData.remarks = remarks;
    }

    const updatedFee = await Fee.findByIdAndUpdate(feeId, updateData, { new: true })
      .populate("studentId", "name studentId");

    res.json({
      success: true,
      message: "Fee status updated successfully",
      data: updatedFee,
    });
  } catch (error) {
    console.error("Update fee status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating fee status",
    });
  }
};

module.exports = {
  createFee,
  getAllFees,
  getStudentFees,
  processFeePayment,
  updateFee,
  deleteFee,
  getFeeStats,
  getClassFeeStatus,
  createClassFees,
  updateFeeStatus,
};
