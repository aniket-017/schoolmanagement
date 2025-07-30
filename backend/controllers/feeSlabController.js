const FeeSlab = require("../models/FeeSlab");

// @desc    Get all fee slabs
// @route   GET /api/fee-slabs
// @access  Private (Admin only)
const getAllFeeSlabs = async (req, res) => {
  try {
    const { academicYear, isActive } = req.query;
    const filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const feeSlabs = await FeeSlab.find(filter)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feeSlabs.length,
      data: feeSlabs,
    });
  } catch (error) {
    console.error("Get fee slabs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee slabs",
    });
  }
};

// @desc    Get fee slab by ID
// @route   GET /api/fee-slabs/:id
// @access  Private (Admin only)
const getFeeSlabById = async (req, res) => {
  try {
    const feeSlab = await FeeSlab.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feeSlab,
    });
  } catch (error) {
    console.error("Get fee slab error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee slab",
    });
  }
};

// @desc    Create fee slab
// @route   POST /api/fee-slabs
// @access  Private (Admin only)
const createFeeSlab = async (req, res) => {
  try {
    const { slabName, totalAmount, academicYear, classGrades, installments } = req.body;

    // Calculate percentages for installments if not provided
    const processedInstallments = installments.map((installment, index) => {
      const percentage = installment.percentage || (installment.amount / totalAmount) * 100;
      return {
        installmentNumber: index + 1,
        amount: installment.amount,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        dueDate: installment.dueDate,
        description: installment.description || `Installment ${index + 1}`,
      };
    });

    // Adjust the last installment to ensure total equals 100%
    if (processedInstallments.length > 0) {
      const totalPercentage = processedInstallments.reduce((sum, installment) => sum + installment.percentage, 0);
      const difference = 100 - totalPercentage;

      if (Math.abs(difference) > 0.01) {
        // Add the difference to the last installment
        processedInstallments[processedInstallments.length - 1].percentage += difference;
      }
    }

    const feeSlab = await FeeSlab.create({
      slabName,
      totalAmount,
      academicYear,
      classGrades,
      installments: processedInstallments,
      createdBy: req.user.id,
    });

    await feeSlab.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Fee slab created successfully",
      data: feeSlab,
    });
  } catch (error) {
    console.error("Create fee slab error:", error);
    if (error.message.includes("percentages must add up")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating fee slab",
    });
  }
};

// @desc    Update fee slab
// @route   PUT /api/fee-slabs/:id
// @access  Private (Admin only)
const updateFeeSlab = async (req, res) => {
  try {
    const feeSlab = await FeeSlab.findById(req.params.id);
    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found",
      });
    }

    const { slabName, totalAmount, academicYear, classGrades, installments, isActive } = req.body;

    // Process installments if provided
    let processedInstallments = feeSlab.installments;
    if (installments) {
      processedInstallments = installments.map((installment, index) => {
        const percentage = installment.percentage || (installment.amount / totalAmount) * 100;
        return {
          installmentNumber: index + 1,
          amount: installment.amount,
          percentage: Math.round(percentage * 100) / 100,
          dueDate: installment.dueDate,
          description: installment.description || `Installment ${index + 1}`,
        };
      });

      // Adjust the last installment to ensure total equals 100%
      if (processedInstallments.length > 0) {
        const totalPercentage = processedInstallments.reduce((sum, installment) => sum + installment.percentage, 0);
        const difference = 100 - totalPercentage;
        
        if (Math.abs(difference) > 0.01) {
          // Add the difference to the last installment
          processedInstallments[processedInstallments.length - 1].percentage += difference;
        }
      }
    }

    const updatedFeeSlab = await FeeSlab.findByIdAndUpdate(
      req.params.id,
      {
        slabName: slabName || feeSlab.slabName,
        totalAmount: totalAmount || feeSlab.totalAmount,
        academicYear: academicYear || feeSlab.academicYear,
        classGrades: classGrades || feeSlab.classGrades,
        installments: processedInstallments,
        isActive: isActive !== undefined ? isActive : feeSlab.isActive,
        lastModifiedBy: req.user.id,
      },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Fee slab updated successfully",
      data: updatedFeeSlab,
    });
  } catch (error) {
    console.error("Update fee slab error:", error);
    if (error.message.includes("percentages must add up")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating fee slab",
    });
  }
};

// @desc    Delete fee slab
// @route   DELETE /api/fee-slabs/:id
// @access  Private (Admin only)
const deleteFeeSlab = async (req, res) => {
  try {
    const feeSlab = await FeeSlab.findByIdAndDelete(req.params.id);

    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fee slab deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee slab error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting fee slab",
    });
  }
};

// @desc    Calculate installments with concession
// @route   POST /api/fee-slabs/:id/calculate-concession
// @access  Private
const calculateWithConcession = async (req, res) => {
  try {
    const { concessionAmount } = req.body;
    const feeSlab = await FeeSlab.findById(req.params.id);

    if (!feeSlab) {
      return res.status(404).json({
        success: false,
        message: "Fee slab not found",
      });
    }

    if (concessionAmount < 0 || concessionAmount > feeSlab.totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid concession amount",
      });
    }

    const adjustedInstallments = feeSlab.calculateWithConcession(concessionAmount);

    res.status(200).json({
      success: true,
      data: {
        originalTotal: feeSlab.totalAmount,
        concessionAmount,
        adjustedTotal: feeSlab.totalAmount - concessionAmount,
        installments: adjustedInstallments,
      },
    });
  } catch (error) {
    console.error("Calculate concession error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating concession",
    });
  }
};

module.exports = {
  getAllFeeSlabs,
  getFeeSlabById,
  createFeeSlab,
  updateFeeSlab,
  deleteFeeSlab,
  calculateWithConcession,
};
