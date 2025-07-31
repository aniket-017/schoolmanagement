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

// @desc    Create fees from fee slab for a student
// @route   POST /api/fees/student/:studentId/from-slab
// @access  Private (Admin only)
const createFeesFromSlab = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { feeSlabId, academicYear } = req.body;

    // Check if student exists
    const Student = require("../models/Student");
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if fee slab exists
    const FeeSlab = require("../models/FeeSlab");
    const feeSlab = await FeeSlab.findById(feeSlabId);
    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found",
      });
    }

    // Check if fees already exist for this student and fee slab
    const existingFees = await Fee.find({
      studentId,
      feeSlabId: feeSlabId,
      academicYear: academicYear || feeSlab.academicYear,
    });

    if (existingFees.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Fees already exist for this student and fee slab",
      });
    }

    // Create fee records for each installment
    const createdFees = [];
    for (const installment of feeSlab.installments) {
      const fee = await Fee.create({
        studentId,
        feeSlabId: feeSlab._id,
        feeType: "tuition", // Default to tuition, can be customized
        amount: installment.amount,
        dueDate: installment.dueDate,
        academicYear: academicYear || feeSlab.academicYear,
        installmentNumber: installment.installmentNumber,
        status: "pending",
        remarks: installment.description || `Installment ${installment.installmentNumber}`,
        processedBy: req.user.id,
      });
      createdFees.push(fee);
    }

    // Update student's fee slab assignment
    await Student.findByIdAndUpdate(studentId, {
      feeSlabId: feeSlab._id,
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: `Fee records created successfully for ${createdFees.length} installments`,
      data: {
        createdCount: createdFees.length,
        fees: createdFees,
        feeSlab: {
          _id: feeSlab._id,
          slabName: feeSlab.slabName,
          totalAmount: feeSlab.totalAmount,
        },
      },
    });
  } catch (error) {
    console.error("Create fees from slab error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating fees from slab",
    });
  }
};

// @desc    Get student fees with fee slab information
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
      .populate("feeSlabId", "slabName totalAmount installments")
      .sort({ dueDate: -1 });

    // Get student's fee slab information and admin-updated fee data
    const Student = require("../models/Student");
    const student = await Student.findById(studentId).populate("feeSlabId", "slabName totalAmount installments");

    // Use admin-updated fee data from Student model instead of calculating from individual fees
    const totalFees = fees.length;
    const paidFees = student.paymentStatus === "paid" ? totalFees : 0;
    const pendingFees = student.paymentStatus === "pending" ? totalFees : 0;
    const overdueFees = student.paymentStatus === "overdue" ? totalFees : 0;

    // Use admin-updated amounts from Student model
    const totalAmount = student.feeSlabId?.totalAmount || fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = student.feesPaid || 0;
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
        feeSlab: student?.feeSlabId || null,
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

    // Update Student model with admin-updated fee data
    const Student = require("../models/Student");
    const student = await Student.findById(fee.studentId);
    
    if (student) {
      // Get all fees for this student to calculate total paid amount
      const allStudentFees = await Fee.find({ studentId: fee.studentId });
      const totalPaidAmount = allStudentFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      
      // Determine overall payment status
      let overallStatus = "pending";
      if (totalPaidAmount >= (student.feeSlabId?.totalAmount || 0)) {
        overallStatus = "paid";
      } else if (totalPaidAmount > 0) {
        overallStatus = "partial";
      } else {
        // Check if any fees are overdue
        const hasOverdueFees = allStudentFees.some(f => f.status === "overdue");
        overallStatus = hasOverdueFees ? "overdue" : "pending";
      }
      
      // Update student's fee information
      await Student.findByIdAndUpdate(fee.studentId, {
        paymentStatus: overallStatus,
        feesPaid: totalPaidAmount,
        paymentDate: new Date(),
        paymentMethod: paymentMethod || student.paymentMethod,
        transactionId: transactionId || student.transactionId,
      });
    }

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

    // Get admin-updated fee data from Student model
    const Student = require("../models/Student");
    
    let studentFilter = {};
    if (academicYear) studentFilter.academicYear = academicYear;
    
    const students = await Student.find(studentFilter).populate("feeSlabId", "totalAmount");

    // Calculate statistics using admin-updated data
    let totalFees = 0;
    let totalAmount = 0;
    let totalPaidAmount = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    students.forEach(student => {
      // Count fees based on fee slab installments
      if (student.feeSlabId) {
        const installmentCount = student.feeSlabId.installments?.length || 1;
        totalFees += installmentCount;
        totalAmount += student.feeSlabId.totalAmount || 0;
      }
      
      totalPaidAmount += student.feesPaid || 0;
      
      // Count students by payment status
      switch (student.paymentStatus) {
        case "paid":
          paidCount += 1;
          break;
        case "pending":
          pendingCount += 1;
          break;
        case "overdue":
          overdueCount += 1;
          break;
        default:
          pendingCount += 1;
      }
    });

    const formattedStats = {
      totalFees,
      totalAmount,
      totalPaidAmount,
      pending: pendingCount,
      paid: paidCount,
      overdue: overdueCount,
      partial: 0, // Not used in admin-updated model
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

    // Group fees by student and use admin-updated data
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

    // Process fee data and use admin-updated information
    fees.forEach(fee => {
      const studentId = fee.studentId._id.toString();
      if (studentFeeStatus[studentId]) {
        studentFeeStatus[studentId].fees.push(fee);
      }
    });

    // Update with admin-updated data from Student model
    for (const student of students) {
      const studentId = student._id.toString();
      if (studentFeeStatus[studentId]) {
        // Use admin-updated payment status and amounts
        studentFeeStatus[studentId].status = student.paymentStatus || "pending";
        studentFeeStatus[studentId].paidAmount = student.feesPaid || 0;
        
        // Get total amount from fee slab or calculate from fees
        if (student.feeSlabId) {
          studentFeeStatus[studentId].totalAmount = student.feeSlabId.totalAmount || 0;
        } else {
          studentFeeStatus[studentId].totalAmount = studentFeeStatus[studentId].fees.reduce((sum, fee) => sum + fee.amount, 0);
        }
        
        studentFeeStatus[studentId].pendingAmount = studentFeeStatus[studentId].totalAmount - studentFeeStatus[studentId].paidAmount;
      }
    }

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

    // Update Student model with admin-updated fee data
    const Student = require("../models/Student");
    const student = await Student.findById(fee.studentId);
    
    if (student) {
      // Get all fees for this student to calculate total paid amount
      const allStudentFees = await Fee.find({ studentId: fee.studentId });
      const totalPaidAmount = allStudentFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      
      // Determine overall payment status
      let overallStatus = "pending";
      if (totalPaidAmount >= (student.feeSlabId?.totalAmount || 0)) {
        overallStatus = "paid";
      } else if (totalPaidAmount > 0) {
        overallStatus = "partial";
      } else {
        // Check if any fees are overdue
        const hasOverdueFees = allStudentFees.some(f => f.status === "overdue");
        overallStatus = hasOverdueFees ? "overdue" : "pending";
      }
      
      // Update student's fee information
      await Student.findByIdAndUpdate(fee.studentId, {
        paymentStatus: overallStatus,
        feesPaid: totalPaidAmount,
        paymentDate: status === "paid" ? new Date() : student.paymentDate,
        paymentMethod: paymentMethod || student.paymentMethod,
        transactionId: transactionId || student.transactionId,
      });
    }

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

// @desc    Generate fee records for student with fee slab but no fees
// @route   POST /api/fees/student/:studentId/generate
// @access  Private (Admin only)
const generateFeesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const Student = require("../models/Student");
    const student = await Student.findById(studentId).populate("feeSlabId");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student has a fee slab assigned
    if (!student.feeSlabId) {
      return res.status(400).json({
        success: false,
        message: "Student does not have a fee slab assigned",
      });
    }

    // Check if fees already exist for this student
    const existingFees = await Fee.find({
      studentId,
      feeSlabId: student.feeSlabId._id,
    });

    if (existingFees.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Fee records already exist for this student",
      });
    }

    // Create fee records for each installment
    const createdFees = [];
    for (const installment of student.feeSlabId.installments) {
      const fee = await Fee.create({
        studentId,
        feeSlabId: student.feeSlabId._id,
        feeType: "tuition", // Default to tuition, can be customized
        amount: installment.amount,
        dueDate: installment.dueDate,
        academicYear: student.feeSlabId.academicYear,
        installmentNumber: installment.installmentNumber,
        status: "pending",
        remarks: installment.description || `Installment ${installment.installmentNumber}`,
        processedBy: req.user.id,
      });
      createdFees.push(fee);
    }

    res.status(201).json({
      success: true,
      message: `Fee records generated successfully for ${createdFees.length} installments`,
      data: {
        createdCount: createdFees.length,
        fees: createdFees,
        feeSlab: {
          _id: student.feeSlabId._id,
          slabName: student.feeSlabId.slabName,
          totalAmount: student.feeSlabId.totalAmount,
        },
      },
    });
  } catch (error) {
    console.error("Generate fees for student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating fees",
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
  createFeesFromSlab,
  generateFeesForStudent,
};
