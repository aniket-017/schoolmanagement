const Fee = require("../models/Fee");
const User = require("../models/User");
const Student = require("../models/Student");
const { findStudentById } = require("../utils/studentLookup");

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin only)
const createFee = async (req, res) => {
  try {
    const { studentId, feeType, amount, dueDate, academicYear, semester, month, discount, remarks } = req.body;

    // Find student using utility function
    const studentResult = await findStudentById(studentId);

    if (!studentResult.found) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { student, isStudentModel, userRecord } = studentResult;

    // Use the User record ID for fee creation
    const feeStudentId = userRecord._id;

    const fee = await Fee.create({
      studentId: feeStudentId,
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
        student: {
          _id: student._id,
          name: student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim(),
          concessionAmount: student.concessionAmount || 0,
          paymentStatus: student.paymentStatus,
          feeStructure: student.feeStructure,
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
    console.log("=== PAYMENT PROCESSING STARTED ===");
    console.log("Fee ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("User processing payment:", req.user.id, req.user.role);

    const { paidAmount, paymentMethod, transactionId, remarks } = req.body;

    console.log("Finding fee record...");
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      console.log("❌ Fee record not found!");
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    console.log("✅ Fee record found:");
    console.log("- Fee ID:", fee._id);
    console.log("- Student ID:", fee.studentId);
    console.log("- Fee Type:", fee.feeType);
    console.log("- Total Amount:", fee.amount);
    console.log("- Previously Paid:", fee.paidAmount);
    console.log("- Academic Year:", fee.academicYear);

    // Check if user is authorized to pay this fee
    if (req.user.role === "student" && req.user.id !== fee.studentId.toString()) {
      console.log("❌ Access denied for student");
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Calculate remaining balance for this specific fee
    const remainingBalance = fee.amount - fee.paidAmount + fee.penalty - fee.discount;
    console.log("Payment validation:");
    console.log("- Remaining balance for this fee:", remainingBalance);
    console.log("- Payment amount:", paidAmount);

    if (paidAmount > remainingBalance) {
      console.log("❌ Payment amount exceeds remaining balance for this fee");
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining balance for this fee",
      });
    }

    console.log("✅ Payment amount validated");

    // Get the payment date from request body or use current date as fallback
    const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();

    // Update fee record
    console.log("Updating fee record...");
    fee.paidAmount += paidAmount;
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.remarks = remarks;
    fee.processedBy = req.user.id;

    // Update fee status based on payment
    if (fee.paidAmount >= fee.amount) {
      fee.status = "paid";
      fee.paidDate = paymentDate;
      console.log("✅ Fee fully paid, setting status to paid");
    } else if (fee.paidAmount > 0) {
      fee.status = "partial";
      fee.paidDate = paymentDate;
      console.log("✅ Fee partially paid, setting status to partial");
    }

    await fee.save();
    console.log("✅ Fee record updated successfully");

    // Add payment record to student's payment history
    console.log("Adding payment to student's payment history...");
    console.log("Looking for student with ID:", fee.studentId);

    const studentForPayment = await Student.findById(fee.studentId);

    if (!studentForPayment) {
      console.log("❌ Student not found in Student model with ID:", fee.studentId);
    } else {
      console.log("✅ Student found:");
      console.log("- Student ID:", studentForPayment._id);
      console.log("- Student Name:", studentForPayment.name || studentForPayment.firstName);
      console.log(
        "- Current payment history length:",
        studentForPayment.paymentHistory ? studentForPayment.paymentHistory.length : 0
      );

      const paymentRecord = {
        paymentDate: paymentDate,
        amount: paidAmount,
        paymentMethod,
        transactionId,
        receiptNumber: fee.receiptNumber,
        feeType: fee.feeType,
        installmentNumber: fee.installmentNumber,
        academicYear: fee.academicYear,
        semester: fee.semester,
        month: fee.month,
        remarks,
        processedBy: req.user.id,
        status: "completed",
      };

      console.log("Payment record to add:", paymentRecord);

      studentForPayment.paymentHistory.push(paymentRecord);

      console.log("Payment history after push:", studentForPayment.paymentHistory.length);

      await studentForPayment.save();
      console.log("✅ Student payment history updated and saved successfully");

      // Verify the payment was saved
      const verifyStudent = await Student.findById(fee.studentId);
      console.log("Verification - Payment history length after save:", verifyStudent.paymentHistory.length);
      console.log("Latest payment record:", verifyStudent.paymentHistory[verifyStudent.paymentHistory.length - 1]);
    }

    await fee.populate("studentId", "name studentId");

    // Update Student model with admin-updated fee data
    // Use the already imported Student model, don't re-require it
    const student = await Student.findById(fee.studentId);

    if (student) {
      // Get all fees for this student to calculate total paid amount
      const allStudentFees = await Fee.find({ studentId: fee.studentId });
      const totalPaidAmount = allStudentFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);

      // Get the fee slab to calculate total expected amount
      const FeeSlab = require("../models/FeeSlab");
      const feeSlab = student.feeSlabId ? await FeeSlab.findById(student.feeSlabId) : null;
      const totalExpectedAmount = feeSlab ? feeSlab.totalAmount : 0;

      // Determine overall payment status
      let overallStatus = "pending";
      if (totalPaidAmount >= totalExpectedAmount) {
        overallStatus = "paid";
      } else if (totalPaidAmount > 0) {
        overallStatus = "partial";
      } else {
        // Check if any fees are overdue
        const hasOverdueFees = allStudentFees.some((f) => f.status === "overdue");
        overallStatus = hasOverdueFees ? "overdue" : "pending";
      }

      // Update student's fee information
      await Student.findByIdAndUpdate(fee.studentId, {
        paymentStatus: overallStatus,
        feesPaid: totalPaidAmount,
        paymentDate: paymentDate,
        paymentMethod: paymentMethod || student.paymentMethod,
        transactionId: transactionId || student.transactionId,
      });

      console.log("✅ Student payment status updated:");
      console.log("- Total paid amount:", totalPaidAmount);
      console.log("- Total expected amount:", totalExpectedAmount);
      console.log("- Overall status:", overallStatus);
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

    students.forEach((student) => {
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
      isActive: { $ne: false },
    });

    console.log("Found students in User model:", students.length);

    // If no students found in User model, try Student model
    if (students.length === 0) {
      students = await Student.find({
        class: classId,
        isActive: { $ne: false },
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

    const studentIds = students.map((student) => student._id);

    // Get fee information for all students in the class
    let feeFilter = { studentId: { $in: studentIds } };
    if (academicYear) feeFilter.academicYear = academicYear;
    if (month) feeFilter.month = month;

    const fees = await Fee.find(feeFilter).populate("studentId", "name studentId rollNumber").sort({ dueDate: 1 });

    // Group fees by student and use admin-updated data
    const studentFeeStatus = {};
    students.forEach((student) => {
      studentFeeStatus[student._id.toString()] = {
        student: {
          _id: student._id,
          name:
            student.name || `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim(),
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
    fees.forEach((fee) => {
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
          studentFeeStatus[studentId].totalAmount = studentFeeStatus[studentId].fees.reduce(
            (sum, fee) => sum + fee.amount,
            0
          );
        }

        studentFeeStatus[studentId].pendingAmount =
          studentFeeStatus[studentId].totalAmount - studentFeeStatus[studentId].paidAmount;
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
      isActive: { $ne: false },
    });

    // If no students found in User model, try Student model
    if (students.length === 0) {
      students = await Student.find({
        class: classId,
        isActive: { $ne: false },
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
    const { status, paidAmount, paymentMethod, transactionId, remarks, paymentDate } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    // Get the payment date from request body or use current date as fallback
    const selectedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

    const updateData = { status };

    if (status === "paid") {
      updateData.paidAmount = paidAmount || fee.amount;
      updateData.paidDate = selectedPaymentDate;
      updateData.paymentMethod = paymentMethod;
      updateData.transactionId = transactionId;
    } else if (status === "partial") {
      updateData.paidAmount = paidAmount || 0;
      updateData.paidDate = selectedPaymentDate;
      updateData.paymentMethod = paymentMethod;
      updateData.transactionId = transactionId;
    }

    if (remarks) {
      updateData.remarks = remarks;
    }

    const updatedFee = await Fee.findByIdAndUpdate(feeId, updateData, { new: true }).populate(
      "studentId",
      "name studentId"
    );

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
        const hasOverdueFees = allStudentFees.some((f) => f.status === "overdue");
        overallStatus = hasOverdueFees ? "overdue" : "pending";
      }

      // Update student's fee information
      await Student.findByIdAndUpdate(fee.studentId, {
        paymentStatus: overallStatus,
        feesPaid: totalPaidAmount,
        paymentDate: status === "paid" ? selectedPaymentDate : student.paymentDate,
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

// @desc    Get comprehensive fee overview statistics
// @route   GET /api/fees/overview
// @access  Private (Admin only)
const getFeeOverview = async (req, res) => {
  try {
    const { academicYear, month } = req.query;

    // Get admin-updated fee data from Student model
    const Student = require("../models/Student");

    let studentFilter = {};
    if (academicYear) studentFilter.academicYear = academicYear;

    const students = await Student.find(studentFilter).populate("feeSlabId", "totalAmount installments");

    // Calculate comprehensive statistics
    let totalCollection = 0;
    let pendingFees = 0;
    let studentsPaid = 0;
    let totalAmount = 0;
    let totalPaidAmount = 0;
    let paymentMethods = {
      online: 0,
      cash: 0,
      card: 0,
      cheque: 0,
      bank_transfer: 0,
      other: 0,
    };

    // Monthly data for the last 6 months - using REAL payment data
    const monthlyData = [];
    const currentDate = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get actual payment data from Fee collection for the last 6 months
    const Fee = require("../models/Fee");

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      const monthName = months[monthDate.getMonth()];

      // Calculate monthly collection from Student payment history
      let monthlyCollected = 0;
      let monthlyPending = 0;

      // Aggregate payment history from all students for this month
      students.forEach((student) => {
        const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
        const studentPaidAmount = student.feesPaid || 0;
        const balance = studentTotalAmount - studentPaidAmount;

        // Check payment history for this month
        if (student.paymentHistory && student.paymentHistory.length > 0) {
          student.paymentHistory.forEach((payment) => {
            const paymentDate = new Date(payment.paymentDate);
            if (paymentDate >= monthDate && paymentDate < nextMonthDate) {
              monthlyCollected += payment.amount || 0;
            }
          });
        }

        // Calculate pending for this month based on fee structure
        if (student.feeSlabId && student.feeSlabId.installments) {
          for (const installment of student.feeSlabId.installments) {
            if (installment.dueDate) {
              const dueDate = new Date(installment.dueDate);
              if (dueDate >= monthDate && dueDate < nextMonthDate) {
                // This installment is due in this month
                const installmentAmount = installment.amount || 0;
                const installmentPaid = installment.paidAmount || 0;
                const installmentPending = installmentAmount - installmentPaid;
                if (installmentPending > 0) {
                  monthlyPending += installmentPending;
                }
              }
            }
          }
        } else if (balance > 0) {
          // If no installments, use overall balance
          monthlyPending += balance;
        }
      });

      monthlyData.push({
        month: monthName,
        collected: monthlyCollected,
        pending: monthlyPending,
      });
    }

    // Calculate current month's collection
    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    let currentMonthCollection = 0;

    students.forEach((student) => {
      if (student.paymentHistory && student.paymentHistory.length > 0) {
        student.paymentHistory.forEach((payment) => {
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate >= currentMonthDate && paymentDate < nextMonthDate) {
            currentMonthCollection += payment.amount || 0;
          }
        });
      }
    });

    // Process students with async support
    for (const student of students) {
      const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
      const studentPaidAmount = student.feesPaid || 0;

      totalAmount += studentTotalAmount;
      totalPaidAmount += studentPaidAmount;

      // Calculate payment status
      let status = "pending";
      if (studentPaidAmount >= studentTotalAmount && studentPaidAmount > 0) {
        status = "paid";
      } else if (studentPaidAmount === 0) {
        status = "pending";
      } else if (studentPaidAmount > 0 && studentPaidAmount < studentTotalAmount) {
        status = "pending";
      }

      // Count students by payment status
      switch (status) {
        case "paid":
          studentsPaid += 1;
          totalCollection += studentPaidAmount; // Add actual amount paid
          break;
        case "pending":
          pendingFees += studentTotalAmount - studentPaidAmount;
          totalCollection += studentPaidAmount; // Add actual amount paid
          break;
        default:
          pendingFees += studentTotalAmount - studentPaidAmount;
          totalCollection += studentPaidAmount; // Add actual amount paid
      }

      // Count payment methods from payment history
      if (student.paymentHistory && student.paymentHistory.length > 0) {
        student.paymentHistory.forEach((payment) => {
          if (payment.paymentMethod) {
            paymentMethods[payment.paymentMethod] = (paymentMethods[payment.paymentMethod] || 0) + 1;
          }
        });
      } else if (student.paymentMethod) {
        // Fallback to student's payment method if no payment history
        paymentMethods[student.paymentMethod] = (paymentMethods[student.paymentMethod] || 0) + 1;
      }
    }

    // Calculate percentage changes based on real data
    // For now using sample changes, but these could be calculated from historical data
    const totalCollectionChange = totalCollection > 0 ? "+12.5%" : "0%";
    const pendingFeesChange = pendingFees > 0 ? "-8.2%" : "0%";
    const studentsPaidChange = studentsPaid > 0 ? `+${studentsPaid}` : "0";

    // Get payment methods from Student payment history
    const studentPaymentMethods = await Student.aggregate([
      {
        $match: {
          "paymentHistory.paymentMethod": {
            $exists: true,
            $ne: null,
            $ne: "",
            $in: ["cash", "online", "cheque", "card", "bank_transfer", "other"],
          },
        },
      },
      {
        $unwind: "$paymentHistory",
      },
      {
        $match: {
          "paymentHistory.paymentMethod": {
            $exists: true,
            $ne: null,
            $ne: "",
            $in: ["cash", "online", "cheque", "card", "bank_transfer", "other"],
          },
          "paymentHistory.amount": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$paymentHistory.paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paymentHistory.amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Use only Student payment history data
    const combinedPaymentMethods = {};

    // Add Student collection data
    studentPaymentMethods.forEach((method) => {
      if (!combinedPaymentMethods[method._id]) {
        combinedPaymentMethods[method._id] = { count: 0, totalAmount: 0 };
      }
      combinedPaymentMethods[method._id].count += method.count;
      combinedPaymentMethods[method._id].totalAmount += method.totalAmount;
    });

    // Calculate payment methods percentages from combined data
    const totalPayments = Object.values(combinedPaymentMethods).reduce((sum, method) => sum + method.count, 0);
    const paymentMethodsData = [];

    console.log("Payment Methods Debug:", {
      studentPaymentMethods: studentPaymentMethods,
      combinedPaymentMethods,
      totalPayments,
    });

    if (totalPayments > 0) {
      Object.entries(combinedPaymentMethods).forEach(([method, data]) => {
        const percentage = Math.round((data.count / totalPayments) * 100);
        const methodName = method.charAt(0).toUpperCase() + method.slice(1);
        paymentMethodsData.push({
          name: methodName,
          value: percentage,
          color: getPaymentMethodColor(method),
        });
      });
    } else {
      // If no payment methods data, show empty state
      paymentMethodsData.push({ name: "No Payments", value: 100, color: "#6B7280" });
    }

    // Debug logging to verify data
    console.log("Fee Overview Data:", {
      totalCollection,
      pendingFees,
      studentsPaid,
      totalStudents: students.length,
      monthlyData: monthlyData.slice(0, 3), // Log first 3 months
    });

    // Log individual student status for debugging
    students.forEach((student, index) => {
      const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
      const studentPaidAmount = student.feesPaid || 0;
      const balance = studentTotalAmount - studentPaidAmount;

      let status = "pending";
      if (studentPaidAmount >= studentTotalAmount && studentPaidAmount > 0) {
        status = "paid";
      } else if (studentPaidAmount === 0) {
        status = "pending";
      } else if (studentPaidAmount > 0 && studentPaidAmount < studentTotalAmount) {
        status = "pending";
      }

      console.log(`Student ${index + 1}:`, {
        name: `${student.firstName} ${student.lastName}`,
        totalAmount: studentTotalAmount,
        paidAmount: studentPaidAmount,
        balance,
        originalStatus: student.paymentStatus,
        calculatedStatus: status,
      });
    });

    // Log August calculation specifically
    const augustData = monthlyData.find((data) => data.month === "Aug");
    if (augustData) {
      console.log("August Calculation:", {
        month: augustData.month,
        collected: augustData.collected,
        pending: augustData.pending,
      });
    }

    const overviewData = {
      summaryCards: {
        totalCollection: {
          value: `₹${currentMonthCollection.toLocaleString()}`,
          change: totalCollectionChange,
          changeType: "increase",
        },
        pendingFees: {
          value: `₹${pendingFees.toLocaleString()}`,
          change: pendingFeesChange,
          changeType: "decrease",
        },
        studentsPaid: {
          value: studentsPaid.toString(),
          change: studentsPaidChange,
          changeType: "increase",
        },
      },
      monthlyData,
      paymentMethods: paymentMethodsData,
    };

    res.json({
      success: true,
      data: overviewData,
    });
  } catch (error) {
    console.error("Get fee overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee overview",
    });
  }
};

// Helper function to get payment method colors
const getPaymentMethodColor = (method) => {
  const colors = {
    online: "#3B82F6",
    cash: "#10B981",
    card: "#F59E0B",
    cheque: "#EF4444",
    bank_transfer: "#8B5CF6",
    other: "#6B7280",
  };
  return colors[method] || "#6B7280";
};

// @desc    Get students with overdue installments
// @route   GET /api/fees/overdue-students
// @access  Private (Admin only)
const getOverdueStudents = async (req, res) => {
  try {
    const currentDate = new Date();

    // Get all students with fee slabs
    const students = await Student.find({
      isActive: true,
      feeSlabId: { $exists: true, $ne: null },
    })
      .populate("feeSlabId", "slabName totalAmount installments")
      .populate("class", "name grade division");

    const overdueStudents = [];

    students.forEach((student) => {
      if (student.feeSlabId && student.feeSlabId.installments) {
        const overdueInstallments = student.feeSlabId.installments.filter((installment) => {
          const dueDate = new Date(installment.dueDate);
          const isOverdue = dueDate < currentDate;

          // Calculate remaining amount for this installment
          const totalInstallmentAmount = installment.amount;
          const paidAmount = student.feesPaid || 0;
          const remainingAmount = Math.max(0, totalInstallmentAmount - paidAmount);

          return isOverdue && remainingAmount > 0;
        });

        if (overdueInstallments.length > 0) {
          // Calculate total overdue amount
          const totalOverdueAmount = overdueInstallments.reduce((sum, installment) => {
            const totalInstallmentAmount = installment.amount;
            const paidAmount = student.feesPaid || 0;
            const remainingAmount = Math.max(0, totalInstallmentAmount - paidAmount);
            return sum + remainingAmount;
          }, 0);

          overdueStudents.push({
            ...student.toObject(),
            overdueInstallments,
            totalOverdueAmount,
            overdueCount: overdueInstallments.length,
          });
        }
      }
    });

    res.json({
      success: true,
      data: overdueStudents,
      count: overdueStudents.length,
    });
  } catch (error) {
    console.error("Error fetching overdue students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overdue students",
      error: error.message,
    });
  }
};

// @desc    Get payment history for a student
// @route   GET /api/fees/student/:studentId/payment-history
// @access  Private (Admin only)
const getStudentPaymentHistory = async (req, res) => {
  try {
    console.log("=== PAYMENT HISTORY REQUEST STARTED ===");
    const { studentId } = req.params;
    const { page = 1, limit = 20, academicYear, feeType } = req.query;

    console.log("Payment history request for student:", studentId);
    console.log("Query parameters:", { page, limit, academicYear, feeType });

    // Find student using utility function
    console.log("Finding student using utility function...");
    const studentResult = await findStudentById(studentId);

    if (!studentResult.found) {
      console.log("❌ Student not found in either User or Student model:", studentId);
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { student, isStudentModel, userRecord } = studentResult;
    console.log("✅ Student found:", student.name || student.firstName);
    console.log("- Is Student Model:", isStudentModel);
    console.log("- User Record ID:", userRecord._id);

    // Get the Student model record (not User) to access paymentHistory
    let studentRecord = null;
    if (isStudentModel) {
      console.log("Using Student model record directly");
      studentRecord = student;
    } else {
      console.log("Finding Student model record using User ID:", userRecord._id);
      // Find Student model record using User ID
      studentRecord = await Student.findById(userRecord._id);
    }

    console.log("Student record for payment history:");
    console.log("- Student Record ID:", studentRecord?._id);
    console.log("- Student Record Found:", !!studentRecord);
    console.log("- Payment History Array Exists:", !!studentRecord?.paymentHistory);
    console.log("- Payment History Length:", studentRecord?.paymentHistory?.length || 0);

    if (!studentRecord || !studentRecord.paymentHistory) {
      console.log("❌ No student record or payment history found, returning empty response");
      return res.json({
        success: true,
        data: {
          paymentHistory: [],
          summary: {
            totalAmount: 0,
            totalPayments: 0,
            averageAmount: 0,
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalPayments: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }

    // Ensure paymentHistory is an array
    if (!Array.isArray(studentRecord.paymentHistory)) {
      console.log("❌ Payment history is not an array, initializing as empty array");
      studentRecord.paymentHistory = [];
    }

    console.log("✅ Payment history array found, processing...");
    console.log("Original payment history:");
    studentRecord.paymentHistory.forEach((payment, index) => {
      console.log(`  Payment ${index + 1}:`, {
        date: payment.paymentDate,
        amount: payment.amount,
        method: payment.paymentMethod,
        feeType: payment.feeType,
        academicYear: payment.academicYear,
      });
    });

    // Filter payment history based on query parameters
    let filteredPayments = studentRecord.paymentHistory;
    console.log("Applying filters...");
    console.log("- Academic Year filter:", academicYear);
    console.log("- Fee Type filter:", feeType);

    if (academicYear) {
      const beforeFilter = filteredPayments.length;
      filteredPayments = filteredPayments.filter((payment) => payment.academicYear === academicYear);
      console.log(`- Academic Year filter applied: ${beforeFilter} -> ${filteredPayments.length}`);
    }

    if (feeType) {
      const beforeFilter = filteredPayments.length;
      filteredPayments = filteredPayments.filter((payment) => payment.feeType === feeType);
      console.log(`- Fee Type filter applied: ${beforeFilter} -> ${filteredPayments.length}`);
    }

    // Sort by payment date (newest first)
    filteredPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    console.log("✅ Payments sorted by date (newest first)");

    const totalPayments = filteredPayments.length;
    console.log("Total filtered payment records:", totalPayments);

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedPayments = filteredPayments.slice(skip, skip + parseInt(limit));

    // Populate processedBy field
    const populatedPayments = await Student.populate(paginatedPayments, {
      path: "processedBy",
      select: "name",
    });

    console.log("Payment history records found:", paginatedPayments.length);

    // Calculate summary statistics
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    const summaryData = {
      totalAmount,
      totalPayments,
      averageAmount,
    };

    console.log("Summary data:", summaryData);

    const response = {
      success: true,
      data: {
        paymentHistory: populatedPayments,
        summary: {
          totalAmount: summaryData.totalAmount,
          totalPayments: summaryData.totalPayments,
          averageAmount: summaryData.averageAmount,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / limit),
          totalPayments,
          hasNext: parseInt(page) < Math.ceil(totalPayments / limit),
          hasPrev: parseInt(page) > 1,
        },
      },
    };

    console.log("Sending response with", paginatedPayments.length, "payment records");
    console.log("Response structure:", JSON.stringify(response, null, 2));

    // Ensure response is properly formatted
    if (!response || !response.success || !response.data) {
      console.error("❌ Invalid response structure, sending error response");
      return res.status(500).json({
        success: false,
        message: "Invalid response structure",
      });
    }

    // Set proper headers
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");

    res.json(response);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// @desc    Process payment across multiple installments
// @route   PUT /api/fees/student/:studentId/pay
// @access  Private
const processStudentPayment = async (req, res) => {
  try {
    console.log("=== STUDENT PAYMENT PROCESSING STARTED ===");
    console.log("Student ID:", req.params.studentId);
    console.log("Request body:", req.body);

    const { paidAmount, paymentMethod, transactionId, remarks, installmentNumber } = req.body;

    // Find the student
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get the payment date from request body or use current date as fallback
    const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();

    // Get all pending fees for this student
    const pendingFees = await Fee.find({
      studentId: req.params.studentId,
      status: { $in: ["pending", "partial", "overdue"] },
    }).sort({ installmentNumber: 1, dueDate: 1 });

    if (pendingFees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending fees found for this student",
      });
    }

    console.log(`Found ${pendingFees.length} pending fees for student`);

    let remainingPaymentAmount = paidAmount;
    const processedFees = [];
    const paymentRecords = [];

    // If a specific installment is specified, pay that one first
    if (installmentNumber) {
      const targetFee = pendingFees.find((fee) => fee.installmentNumber === installmentNumber);
      if (targetFee) {
        const feeBalance = targetFee.amount - targetFee.paidAmount + targetFee.penalty - targetFee.discount;
        const paymentForThisFee = Math.min(remainingPaymentAmount, feeBalance);

        if (paymentForThisFee > 0) {
          targetFee.paidAmount += paymentForThisFee;
          targetFee.paymentMethod = paymentMethod;
          targetFee.transactionId = transactionId;
          targetFee.remarks = remarks;
          targetFee.processedBy = req.user.id;

          if (targetFee.paidAmount >= targetFee.amount) {
            targetFee.status = "paid";
            targetFee.paidDate = paymentDate;
          } else if (targetFee.paidAmount > 0) {
            targetFee.status = "partial";
            targetFee.paidDate = paymentDate;
          }

          await targetFee.save();
          processedFees.push(targetFee);
          remainingPaymentAmount -= paymentForThisFee;

          paymentRecords.push({
            paymentDate: paymentDate,
            amount: paymentForThisFee,
            paymentMethod,
            transactionId,
            receiptNumber: targetFee.receiptNumber,
            feeType: targetFee.feeType,
            installmentNumber: targetFee.installmentNumber,
            academicYear: targetFee.academicYear,
            semester: targetFee.semester,
            month: targetFee.month,
            remarks,
            processedBy: req.user.id,
            status: "completed",
          });
        }
      }
    }

    // Distribute remaining payment across other pending fees
    for (const fee of pendingFees) {
      if (remainingPaymentAmount <= 0) break;

      // Skip if this fee was already processed (specific installment case)
      if (installmentNumber && fee.installmentNumber === installmentNumber) continue;

      const feeBalance = fee.amount - fee.paidAmount + fee.penalty - fee.discount;
      const paymentForThisFee = Math.min(remainingPaymentAmount, feeBalance);

      if (paymentForThisFee > 0) {
        fee.paidAmount += paymentForThisFee;
        fee.paymentMethod = paymentMethod;
        fee.transactionId = transactionId;
        fee.remarks = remarks;
        fee.processedBy = req.user.id;

        if (fee.paidAmount >= fee.amount) {
          fee.status = "paid";
          fee.paidDate = paymentDate;
        } else if (fee.paidAmount > 0) {
          fee.status = "partial";
          fee.paidDate = paymentDate;
        }

        await fee.save();
        processedFees.push(fee);
        remainingPaymentAmount -= paymentForThisFee;

        paymentRecords.push({
          paymentDate: paymentDate,
          amount: paymentForThisFee,
          paymentMethod,
          transactionId,
          receiptNumber: fee.receiptNumber,
          feeType: fee.feeType,
          installmentNumber: fee.installmentNumber,
          academicYear: fee.academicYear,
          semester: fee.semester,
          month: fee.month,
          remarks,
          processedBy: req.user.id,
          status: "completed",
        });
      }
    }

    // Update student's payment history
    if (paymentRecords.length > 0) {
      student.paymentHistory.push(...paymentRecords);
      await student.save();
    }

    // Update student's overall payment status
    const allStudentFees = await Fee.find({ studentId: req.params.studentId });
    const totalPaidAmount = allStudentFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    // Get the fee slab to calculate total expected amount
    const FeeSlab = require("../models/FeeSlab");
    const feeSlab = student.feeSlabId ? await FeeSlab.findById(student.feeSlabId) : null;
    const totalExpectedAmount = feeSlab ? feeSlab.totalAmount : 0;

    // Determine overall payment status
    let overallStatus = "pending";
    if (totalPaidAmount >= totalExpectedAmount) {
      overallStatus = "paid";
    } else if (totalPaidAmount > 0) {
      overallStatus = "partial";
    } else {
      const hasOverdueFees = allStudentFees.some((f) => f.status === "overdue");
      overallStatus = hasOverdueFees ? "overdue" : "pending";
    }

    // Update student's fee information
    await Student.findByIdAndUpdate(req.params.studentId, {
      paymentStatus: overallStatus,
      feesPaid: totalPaidAmount,
      paymentDate: paymentDate,
      paymentMethod: paymentMethod || student.paymentMethod,
      transactionId: transactionId || student.transactionId,
    });

    // Update installment amounts in fee slab
    if (feeSlab && processedFees.length > 0) {
      const remainingAmount = totalExpectedAmount - totalPaidAmount;

      // Update installment amounts based on payments
      const updatedInstallments = feeSlab.installments.map((installment) => {
        // Find the corresponding fee record
        const feeRecord = allStudentFees.find((fee) => fee.installmentNumber === installment.installmentNumber);

        if (feeRecord) {
          const paidAmount = feeRecord.paidAmount || 0;
          const remainingInstallmentAmount = Math.max(0, installment.amount - paidAmount);

          return {
            ...installment,
            paidAmount: paidAmount,
            remainingAmount: remainingInstallmentAmount,
            status: paidAmount >= installment.amount ? "paid" : paidAmount > 0 ? "partial" : "pending",
          };
        }

        return {
          ...installment,
          paidAmount: 0,
          remainingAmount: installment.amount,
          status: "pending",
        };
      });

      // Update the fee slab with new installment information
      feeSlab.installments = updatedInstallments;
      feeSlab.totalPaidAmount = totalPaidAmount;
      feeSlab.remainingAmount = remainingAmount;

      await feeSlab.save();
    }

    console.log("✅ Student payment processing completed:");
    console.log("- Total payment amount:", paidAmount);
    console.log("- Processed fees count:", processedFees.length);
    console.log("- Total paid amount:", totalPaidAmount);
    console.log("- Overall status:", overallStatus);

    res.json({
      success: true,
      message: "Payment processed successfully across installments",
      data: {
        processedFees,
        totalPaidAmount,
        overallStatus,
        remainingPaymentAmount,
      },
    });
  } catch (error) {
    console.error("Process student payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment",
    });
  }
};

// @desc    Update installment amounts in fee slab based on payments
// @route   PUT /api/fees/update-installments/:studentId
// @access  Private (Admin only)
const updateInstallmentAmounts = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get the fee slab
    const FeeSlab = require("../models/FeeSlab");
    const feeSlab = student.feeSlabId ? await FeeSlab.findById(student.feeSlabId) : null;
    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found for this student",
      });
    }

    // Get all fees for this student
    const studentFees = await Fee.find({ studentId });

    // Calculate total paid amount
    const totalPaidAmount = studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);

    // Calculate remaining amount
    const remainingAmount = feeSlab.totalAmount - totalPaidAmount;

    // Update installment amounts based on payments
    const updatedInstallments = feeSlab.installments.map((installment, index) => {
      // Find the corresponding fee record
      const feeRecord = studentFees.find((fee) => fee.installmentNumber === installment.installmentNumber);

      if (feeRecord) {
        const paidAmount = feeRecord.paidAmount || 0;
        const remainingInstallmentAmount = Math.max(0, installment.amount - paidAmount);

        return {
          ...installment,
          paidAmount: paidAmount,
          remainingAmount: remainingInstallmentAmount,
          status: paidAmount >= installment.amount ? "paid" : paidAmount > 0 ? "partial" : "pending",
        };
      }

      return {
        ...installment,
        paidAmount: 0,
        remainingAmount: installment.amount,
        status: "pending",
      };
    });

    // Update the fee slab with new installment information
    feeSlab.installments = updatedInstallments;
    feeSlab.totalPaidAmount = totalPaidAmount;
    feeSlab.remainingAmount = remainingAmount;

    await feeSlab.save();

    res.json({
      success: true,
      message: "Installment amounts updated successfully",
      data: {
        feeSlab,
        totalPaidAmount,
        remainingAmount,
        updatedInstallments,
      },
    });
  } catch (error) {
    console.error("Update installment amounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating installment amounts",
    });
  }
};

// @desc    Get student fee information with correct installment data
// @route   GET /api/fees/student/:studentId/info
// @access  Private
const getStudentFeeInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user is authorized to view this student's fees
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get student information
    const Student = require("../models/Student");
    const student = await Student.findById(studentId)
      .populate("feeSlabId", "slabName totalAmount installments")
      .populate("class", "name grade division");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all fee records for this student
    const feeRecords = await Fee.find({ studentId })
      .populate("processedBy", "name")
      .sort({ installmentNumber: 1, dueDate: 1 });

    // Calculate total amounts from actual fee records
    const totalAmount = feeRecords.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaidAmount = feeRecords.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const totalPendingAmount = totalAmount - totalPaidAmount;

    // Create installment data from actual fee records
    const installments = feeRecords.map((fee) => {
      const installmentAmount = fee.amount;
      const paidAmount = fee.paidAmount || 0;
      const remainingAmount = installmentAmount - paidAmount;

      let status = "pending";
      if (paidAmount >= installmentAmount) {
        status = "paid";
      } else if (paidAmount > 0) {
        status = "partial";
      }

      // Check if overdue
      const dueDate = new Date(fee.dueDate);
      const currentDate = new Date();
      if (dueDate < currentDate && remainingAmount > 0) {
        status = "overdue";
      }

      return {
        installmentNumber: fee.installmentNumber,
        amount: installmentAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        dueDate: fee.dueDate,
        status: status,
        description: fee.remarks || `Installment ${fee.installmentNumber}`,
        feeType: fee.feeType,
        academicYear: fee.academicYear,
        paymentMethod: fee.paymentMethod,
        transactionId: fee.transactionId,
        paidDate: fee.paidDate,
        processedBy: fee.processedBy,
      };
    });

    // Calculate concession-adjusted amounts if concession is applied
    let adjustedInstallments = installments;
    let concessionAmount = student.concessionAmount || 0;

    if (concessionAmount > 0 && student.feeSlabId) {
      const totalOriginalAmount = student.feeSlabId.totalAmount;
      const discountRatio = concessionAmount / totalOriginalAmount;

      // First, compute adjusted amounts for each installment
      adjustedInstallments = installments.map((installment) => {
        const originalAmount = installment.amount;
        const discountAmount = Math.round(originalAmount * discountRatio);
        const adjustedAmount = originalAmount - discountAmount;

        return {
          ...installment,
          originalAmount,
          discountAmount,
          amount: adjustedAmount,
        };
      });

      // Then redistribute the total paid amount across the adjusted amounts
      // so that no installment shows paid more than its adjusted amount and
      // any overflow carries to subsequent installments
      let remainingPaidToAllocate = totalPaidAmount;
      adjustedInstallments = adjustedInstallments
        .sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0))
        .map((installment) => {
          const payableForThis = Math.max(0, installment.amount);
          const paidApplied = Math.min(remainingPaidToAllocate, payableForThis);
          remainingPaidToAllocate -= paidApplied;

          const remainingAmount = Math.max(0, payableForThis - paidApplied);
          let status = "pending";
          if (paidApplied >= payableForThis && payableForThis > 0) {
            status = "paid";
          } else if (paidApplied > 0) {
            status = "partial";
          }

          return {
            ...installment,
            paidAmount: paidApplied,
            remainingAmount,
            status,
          };
        });
    }

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name:
            student.name || `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim(),
          studentId: student.studentId,
          class: student.class,
          concessionAmount: student.concessionAmount || 0,
          paymentStatus: student.paymentStatus,
          feeStructure: student.feeStructure,
        },
        feeSlab: student.feeSlabId,
        installments: adjustedInstallments,
        summary: {
          totalAmount: totalAmount,
          paidAmount: totalPaidAmount,
          pendingAmount: totalPendingAmount,
          concessionAmount: concessionAmount,
          adjustedTotalAmount: Math.max(0, totalAmount - concessionAmount),
          adjustedPendingAmount: Math.max(0, totalPendingAmount - concessionAmount),
        },
      },
    });
  } catch (error) {
    console.error("Get student fee info error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student fee information",
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
  getFeeOverview,
  getOverdueStudents,
  getStudentPaymentHistory,
  processStudentPayment,
  updateInstallmentAmounts,
  getStudentFeeInfo,
};
