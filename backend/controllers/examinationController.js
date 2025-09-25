const mongoose = require("mongoose");
const Examination = require("../models/Examination");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");
const Grade = require("../models/Grade");

// Create a new examination
exports.createExamination = async (req, res) => {
  try {
    const {
      name,
      type,
      classId,
      subjectId,
      academicYear,
      semester,
      examDate,
      startTime,
      endTime,
      duration,
      venue,
      totalMarks,
      passingMarks,
      instructions,
      syllabus,
      allowedMaterials,
      invigilators,
    } = req.body;

    // Validate required fields
    if (!name || !type || !classId || !subjectId || !examDate || !startTime || !endTime || !duration || !totalMarks || !passingMarks) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check for scheduling conflicts
    const conflictingExam = await Examination.findOne({
      classId,
      examDate,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflictingExam) {
      return res.status(400).json({
        success: false,
        message: "Scheduling conflict: Another exam is scheduled for this class at the same time",
      });
    }

    // Check for room conflicts if room is specified
    if (venue) {
      const roomConflict = await Examination.findOne({
        venue,
        examDate,
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });

      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: "Room conflict: Another exam is scheduled in this room at the same time",
        });
      }
    }

    const examination = new Examination({
      name,
      type,
      classId,
      subjectId,
      academicYear: academicYear || "2024-25",
      semester,
      examDate,
      startTime,
      endTime,
      duration,
      venue,
      totalMarks,
      passingMarks,
      instructions,
      syllabus,
      allowedMaterials,
      invigilators,
    });

    await examination.save();
    await examination.populate(["classId", "subjectId"]);

    res.status(201).json({
      success: true,
      message: "Examination created successfully",
      data: examination,
    });
  } catch (error) {
    console.error("Error creating examination:", error);
    res.status(500).json({
      success: false,
      message: "Error creating examination",
      error: error.message,
    });
  }
};

// Get all examinations with filters
exports.getExaminations = async (req, res) => {
  try {
    const { classId, subjectId, type, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (type) query.type = type;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.examDate = {};
      if (startDate) query.examDate.$gte = new Date(startDate);
      if (endDate) query.examDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const examinations = await Examination.find(query)
      .populate("classId", "name division")
      .populate("subjectId", "name code")
      .sort({ examDate: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Examination.countDocuments(query);

    res.json({
      success: true,
      data: examinations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching examinations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching examinations",
      error: error.message,
    });
  }
};

// Get examination by ID
exports.getExaminationById = async (req, res) => {
  try {
    const examination = await Examination.findById(req.params.id)
      .populate("classId", "name division")
      .populate("subjectId", "name code");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      data: examination,
    });
  } catch (error) {
    console.error("Error fetching examination:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching examination",
      error: error.message,
    });
  }
};

// Get examinations by class
exports.getExaminationsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { status, upcoming } = req.query;

    console.log("getExaminationsByClass - classId:", classId, "upcoming:", upcoming);

    const query = { 
      classId: mongoose.Types.ObjectId.isValid(classId) ? new mongoose.Types.ObjectId(classId) : classId 
    };

    // Filter by status if provided
    if (status) query.status = status;

    // Filter upcoming exams
    if (upcoming === "true") {
      query.examDate = { $gte: new Date() };
    }

    console.log("getExaminationsByClass - Final query:", query);

    const examinations = await Examination.find(query)
      .populate("classId", "name division")
      .populate("subjectId", "name code")
      .sort({ examDate: 1, startTime: 1 });

    console.log("getExaminationsByClass - Found exams:", examinations.length);

    res.json({
      success: true,
      data: examinations,
    });
  } catch (error) {
    console.error("Error fetching class examinations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class examinations",
      error: error.message,
    });
  }
};

// Get examinations by subject
exports.getExaminationsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { status, upcoming } = req.query;

    const query = { subjectId };

    // Filter by status if provided
    if (status) query.status = status;

    // Filter upcoming exams
    if (upcoming === "true") {
      query.examDate = { $gte: new Date() };
    }

    const examinations = await Examination.find(query)
      .populate("classId", "name division")
      .sort({ examDate: 1, startTime: 1 });

    res.json({
      success: true,
      data: examinations,
    });
  } catch (error) {
    console.error("Error fetching subject examinations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subject examinations",
      error: error.message,
    });
  }
};

// Update examination
exports.updateExamination = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check for scheduling conflicts if time-related fields are being updated
    if (updateData.examDate || updateData.startTime || updateData.endTime || updateData.classId) {
      const currentExam = await Examination.findById(id);
      if (!currentExam) {
        return res.status(404).json({
          success: false,
          message: "Examination not found",
        });
      }

      const checkData = {
        classId: updateData.classId || currentExam.classId,
        examDate: updateData.examDate || currentExam.examDate,
        startTime: updateData.startTime || currentExam.startTime,
        endTime: updateData.endTime || currentExam.endTime,
        venue: updateData.venue || currentExam.venue,
      };

      // Check for class conflicts
      const classConflict = await Examination.findOne({
        _id: { $ne: id },
        classId: checkData.classId,
        examDate: checkData.examDate,
        $or: [{ startTime: { $lt: checkData.endTime }, endTime: { $gt: checkData.startTime } }],
      });

      if (classConflict) {
        return res.status(400).json({
          success: false,
          message: "Scheduling conflict: Another exam is scheduled for this class at the same time",
        });
      }

      // Check for room conflicts if room is specified
      if (checkData.venue) {
        const roomConflict = await Examination.findOne({
          _id: { $ne: id },
          venue: checkData.venue,
          examDate: checkData.examDate,
          $or: [{ startTime: { $lt: checkData.endTime }, endTime: { $gt: checkData.startTime } }],
        });

        if (roomConflict) {
          return res.status(400).json({
            success: false,
            message: "Room conflict: Another exam is scheduled in this room at the same time",
          });
        }
      }
    }

    const examination = await Examination.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["classId", "subjectId"]);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      message: "Examination updated successfully",
      data: examination,
    });
  } catch (error) {
    console.error("Error updating examination:", error);
    res.status(500).json({
      success: false,
      message: "Error updating examination",
      error: error.message,
    });
  }
};

// Delete examination
exports.deleteExamination = async (req, res) => {
  try {
    const examination = await Examination.findByIdAndDelete(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    // Also delete related grades
    await Grade.deleteMany({ examId: req.params.id });

    res.json({
      success: true,
      message: "Examination deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting examination:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting examination",
      error: error.message,
    });
  }
};

// Update examination status
exports.updateExaminationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["scheduled", "ongoing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: scheduled, ongoing, completed, cancelled",
      });
    }

    const examination = await Examination.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate(["classId", "subjectId"]);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      message: "Examination status updated successfully",
      data: examination,
    });
  } catch (error) {
    console.error("Error updating examination status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating examination status",
      error: error.message,
    });
  }
};

// Get examinations grouped by name
exports.getExaminationsGrouped = async (req, res) => {
  try {
    const { classId, subjectId, type, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    console.log("getExaminationsGrouped - Query params:", { classId, subjectId, type, status, startDate, endDate, page, limit });

    const query = {}; // Remove isActive filter temporarily to debug

    // Build query filters
    if (classId) {
      // Convert string to ObjectId if needed
      query.classId = mongoose.Types.ObjectId.isValid(classId) ? new mongoose.Types.ObjectId(classId) : classId;
    }
    if (subjectId) query.subjectId = subjectId;
    if (type) query.type = type;
    if (status) query.status = status;

    console.log("getExaminationsGrouped - Final query:", query);

    // Date range filter
    if (startDate || endDate) {
      query.examDate = {};
      if (startDate) query.examDate.$gte = new Date(startDate);
      if (endDate) query.examDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    // Group exams by name and aggregate the data
    const groupedExams = await Examination.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classInfo"
        }
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "invigilators",
          foreignField: "_id",
          as: "invigilatorInfo"
        }
      },
      {
        $group: {
          _id: "$name",
          examName: { $first: "$name" },
          examType: { $first: "$type" },
          totalMarks: { $first: "$totalMarks" },
          passingMarks: { $first: "$passingMarks" },
          instructions: { $first: "$instructions" },
          syllabus: { $first: "$syllabus" },
          allowedMaterials: { $first: "$allowedMaterials" },
          academicYear: { $first: "$academicYear" },
          semester: { $first: "$semester" },
          instances: {
            $push: {
              _id: "$_id",
              classId: "$classId",
              subjectId: "$subjectId",
              examDate: "$examDate",
              startTime: "$startTime",
              endTime: "$endTime",
              duration: "$duration",
              venue: "$venue",
              status: "$status",
              invigilators: "$invigilators",
              classInfo: { $arrayElemAt: ["$classInfo", 0] },
              subjectInfo: { $arrayElemAt: ["$subjectInfo", 0] },
              invigilatorInfo: "$invigilatorInfo",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt"
            }
          },
          instanceCount: { $sum: 1 },
          earliestDate: { $min: "$examDate" },
          latestDate: { $max: "$examDate" },
          statuses: { $addToSet: "$status" }
        }
      },
      {
        $sort: { examName: 1, earliestDate: 1 }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Examination.aggregate([
      { $match: query },
      { $group: { _id: "$name" } },
      { $count: "total" }
    ]);

    console.log("getExaminationsGrouped - Grouped exams count:", groupedExams.length);
    console.log("getExaminationsGrouped - Total groups:", total[0]?.total || 0);
    
    // Debug: Check if there are any exams for this class at all
    const totalExamsForClass = await Examination.countDocuments({ classId: classId });
    console.log("getExaminationsGrouped - Total exams for class:", totalExamsForClass);
    
    // Debug: Check total exams in database
    const totalExamsInDB = await Examination.countDocuments({});
    console.log("getExaminationsGrouped - Total exams in database:", totalExamsInDB);
    
    // Debug: Get a sample exam to see the structure
    const sampleExam = await Examination.findOne({ classId: classId });
    console.log("getExaminationsGrouped - Sample exam:", sampleExam ? {
      _id: sampleExam._id,
      name: sampleExam.name,
      type: sampleExam.type,
      classId: sampleExam.classId,
      isActive: sampleExam.isActive,
      status: sampleExam.status
    } : "No exams found");
    
    // Debug: Get any exam from database
    const anyExam = await Examination.findOne({});
    console.log("getExaminationsGrouped - Any exam in DB:", anyExam ? {
      _id: anyExam._id,
      name: anyExam.name,
      type: anyExam.type,
      classId: anyExam.classId,
      isActive: anyExam.isActive,
      status: anyExam.status
    } : "No exams in database");

    res.json({
      success: true,
      data: groupedExams,
      pagination: {
        current: parseInt(page),
        total: Math.ceil((total[0]?.total || 0) / limit),
        count: total[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching grouped examinations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grouped examinations",
      error: error.message,
    });
  }
};

// Get examination statistics
exports.getExaminationStats = async (req, res) => {
  try {
    const totalExams = await Examination.countDocuments();

    const examsByStatus = await Examination.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const examsByType = await Examination.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);

    const upcomingExams = await Examination.countDocuments({
      examDate: { $gte: new Date() },
      status: "scheduled",
    });

    const completedExams = await Examination.countDocuments({
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        total_exams: totalExams,
        exams_by_status: examsByStatus,
        exams_by_type: examsByType,
        upcoming_exams: upcomingExams,
        completed_exams: completedExams,
      },
    });
  } catch (error) {
    console.error("Error fetching examination statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching examination statistics",
      error: error.message,
    });
  }
};

// Get examination results
exports.getExaminationResults = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await Examination.findById(id)
      .populate("classId", "name division")
      .populate("subjectId", "name code");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    const results = await Grade.find({ examId: id })
      .populate("studentId", "name email rollNumber")
      .sort({ marksObtained: -1 });

    // Calculate statistics
    const totalStudents = results.length;
    const passedStudents = results.filter((result) => result.is_pass).length;
    const avgMarks = results.reduce((sum, result) => sum + result.marks_obtained, 0) / totalStudents;
    const highestMarks = results.length > 0 ? results[0].marks_obtained : 0;
    const lowestMarks = results.length > 0 ? results[results.length - 1].marks_obtained : 0;

    res.json({
      success: true,
      data: {
        examination,
        results,
        statistics: {
          total_students: totalStudents,
          passed_students: passedStudents,
          pass_percentage: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0,
          average_marks: avgMarks.toFixed(2),
          highest_marks: highestMarks,
          lowest_marks: lowestMarks,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching examination results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching examination results",
      error: error.message,
    });
  }
};
