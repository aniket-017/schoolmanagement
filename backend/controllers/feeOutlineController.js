const FeeOutline = require("../models/FeeOutline");
const Class = require("../models/Class");

// @desc    Get all fee outlines
// @route   GET /api/fee-outlines
// @access  Private (Admin only)
const getAllFeeOutlines = async (req, res) => {
  try {
    const { academicYear, classId, isActive } = req.query;

    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (classId) filter.classId = classId;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const feeOutlines = await FeeOutline.find(filter)
      .populate("classId", "name grade section")
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feeOutlines,
    });
  } catch (error) {
    console.error("Get fee outlines error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee outlines",
    });
  }
};

// @desc    Get fee outline by ID
// @route   GET /api/fee-outlines/:id
// @access  Private (Admin only)
const getFeeOutlineById = async (req, res) => {
  try {
    const feeOutline = await FeeOutline.findById(req.params.id)
      .populate("classId", "name grade section")
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    if (!feeOutline) {
      return res.status(404).json({
        success: false,
        message: "Fee outline not found",
      });
    }

    res.json({
      success: true,
      data: feeOutline,
    });
  } catch (error) {
    console.error("Get fee outline by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee outline",
    });
  }
};

// @desc    Create fee outline
// @route   POST /api/fee-outlines
// @access  Private (Admin only)
const createFeeOutline = async (req, res) => {
  try {
    const {
      name,
      description,
      classId,
      academicYear,
      totalAmount,
      components,
      installments,
      concessionTypes,
      lateFeeStructure,
      isDefault,
    } = req.body;

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // If this is set as default, unset any existing default for this class and academic year
    if (isDefault) {
      await FeeOutline.updateMany({ classId, academicYear, isDefault: true }, { isDefault: false });
    }

    const feeOutline = await FeeOutline.create({
      name,
      description,
      classId,
      academicYear,
      totalAmount,
      components: components || [],
      installments: installments || [],
      concessionTypes: concessionTypes || [],
      lateFeeStructure: lateFeeStructure || {},
      isDefault: isDefault || false,
      createdBy: req.user.id,
    });

    await feeOutline.populate("classId", "name grade section");

    res.status(201).json({
      success: true,
      message: "Fee outline created successfully",
      data: feeOutline,
    });
  } catch (error) {
    console.error("Create fee outline error:", error);
    if (error.message.includes("total must equal")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating fee outline",
    });
  }
};

// @desc    Update fee outline
// @route   PUT /api/fee-outlines/:id
// @access  Private (Admin only)
const updateFeeOutline = async (req, res) => {
  try {
    const { isDefault, classId, academicYear } = req.body;

    const feeOutline = await FeeOutline.findById(req.params.id);
    if (!feeOutline) {
      return res.status(404).json({
        success: false,
        message: "Fee outline not found",
      });
    }

    // If this is being set as default, unset any existing default for this class and academic year
    if (isDefault) {
      const targetClassId = classId || feeOutline.classId;
      const targetAcademicYear = academicYear || feeOutline.academicYear;

      await FeeOutline.updateMany(
        {
          classId: targetClassId,
          academicYear: targetAcademicYear,
          isDefault: true,
          _id: { $ne: req.params.id },
        },
        { isDefault: false }
      );
    }

    const updatedFeeOutline = await FeeOutline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate("classId", "name grade section")
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    res.json({
      success: true,
      message: "Fee outline updated successfully",
      data: updatedFeeOutline,
    });
  } catch (error) {
    console.error("Update fee outline error:", error);
    if (error.message.includes("total must equal")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating fee outline",
    });
  }
};

// @desc    Delete fee outline
// @route   DELETE /api/fee-outlines/:id
// @access  Private (Admin only)
const deleteFeeOutline = async (req, res) => {
  try {
    const feeOutline = await FeeOutline.findByIdAndDelete(req.params.id);

    if (!feeOutline) {
      return res.status(404).json({
        success: false,
        message: "Fee outline not found",
      });
    }

    res.json({
      success: true,
      message: "Fee outline deleted successfully",
    });
  } catch (error) {
    console.error("Delete fee outline error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting fee outline",
    });
  }
};

// @desc    Get fee outlines by class
// @route   GET /api/fee-outlines/class/:classId
// @access  Private
const getFeeOutlinesByClass = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const { classId } = req.params;

    let filter = { classId, isActive: true };
    if (academicYear) filter.academicYear = academicYear;

    const feeOutlines = await FeeOutline.find(filter)
      .populate("classId", "name grade section")
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      data: feeOutlines,
    });
  } catch (error) {
    console.error("Get fee outlines by class error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee outlines",
    });
  }
};

// @desc    Get default fee outline for a class
// @route   GET /api/fee-outlines/class/:classId/default
// @access  Private
const getDefaultFeeOutline = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    let filter = { classId, isDefault: true, isActive: true };
    if (academicYear) filter.academicYear = academicYear;

    const defaultFeeOutline = await FeeOutline.findOne(filter).populate("classId", "name grade section");

    if (!defaultFeeOutline) {
      return res.status(404).json({
        success: false,
        message: "No default fee outline found for this class",
      });
    }

    res.json({
      success: true,
      data: defaultFeeOutline,
    });
  } catch (error) {
    console.error("Get default fee outline error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching default fee outline",
    });
  }
};

// @desc    Duplicate fee outline
// @route   POST /api/fee-outlines/:id/duplicate
// @access  Private (Admin only)
const duplicateFeeOutline = async (req, res) => {
  try {
    const { name, academicYear, classId } = req.body;

    const originalOutline = await FeeOutline.findById(req.params.id);
    if (!originalOutline) {
      return res.status(404).json({
        success: false,
        message: "Fee outline not found",
      });
    }

    const duplicateData = {
      ...originalOutline.toObject(),
      name: name || `${originalOutline.name} (Copy)`,
      academicYear: academicYear || originalOutline.academicYear,
      classId: classId || originalOutline.classId,
      isDefault: false, // Duplicates are never default
      createdBy: req.user.id,
      lastModifiedBy: undefined,
    };

    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    const duplicatedOutline = await FeeOutline.create(duplicateData);
    await duplicatedOutline.populate("classId", "name grade section");

    res.status(201).json({
      success: true,
      message: "Fee outline duplicated successfully",
      data: duplicatedOutline,
    });
  } catch (error) {
    console.error("Duplicate fee outline error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while duplicating fee outline",
    });
  }
};

module.exports = {
  getAllFeeOutlines,
  getFeeOutlineById,
  createFeeOutline,
  updateFeeOutline,
  deleteFeeOutline,
  getFeeOutlinesByClass,
  getDefaultFeeOutline,
  duplicateFeeOutline,
};
