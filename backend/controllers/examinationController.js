const Examination = require("../models/Examination");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");
const Grade = require("../models/Grade");

// Create a new examination
exports.createExamination = async (req, res) => {
  try {
    const {
      title,
      description,
      exam_type,
      class_id,
      subject_id,
      exam_date,
      start_time,
      end_time,
      total_marks,
      passing_marks,
      room_number,
      instructions,
    } = req.body;

    // Validate required fields
    if (!title || !exam_type || !class_id || !subject_id || !exam_date || !start_time || !end_time || !total_marks) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check for scheduling conflicts
    const conflictingExam = await Examination.findOne({
      class_id,
      exam_date,
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
    });

    if (conflictingExam) {
      return res.status(400).json({
        success: false,
        message: "Scheduling conflict: Another exam is scheduled for this class at the same time",
      });
    }

    // Check for room conflicts if room is specified
    if (room_number) {
      const roomConflict = await Examination.findOne({
        room_number,
        exam_date,
        $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
      });

      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: "Room conflict: Another exam is scheduled in this room at the same time",
        });
      }
    }

    const examination = new Examination({
      title,
      description,
      exam_type,
      class_id,
      subject_id,
      exam_date,
      start_time,
      end_time,
      total_marks,
      passing_marks,
      room_number,
      instructions,
    });

    await examination.save();
    await examination.populate(["class_id", "subject_id"]);

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
    const { class_id, subject_id, exam_type, status, start_date, end_date, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (class_id) query.class_id = class_id;
    if (subject_id) query.subject_id = subject_id;
    if (exam_type) query.exam_type = exam_type;
    if (status) query.status = status;

    // Date range filter
    if (start_date || end_date) {
      query.exam_date = {};
      if (start_date) query.exam_date.$gte = new Date(start_date);
      if (end_date) query.exam_date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    const examinations = await Examination.find(query)
      .populate("class_id", "name section")
      .populate("subject_id", "name code")
      .sort({ exam_date: 1, start_time: 1 })
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
      .populate("class_id", "name section")
      .populate("subject_id", "name code");

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
    const { class_id } = req.params;
    const { status, upcoming } = req.query;

    const query = { class_id };

    // Filter by status if provided
    if (status) query.status = status;

    // Filter upcoming exams
    if (upcoming === "true") {
      query.exam_date = { $gte: new Date() };
    }

    const examinations = await Examination.find(query)
      .populate("subject_id", "name code")
      .sort({ exam_date: 1, start_time: 1 });

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
    const { subject_id } = req.params;
    const { status, upcoming } = req.query;

    const query = { subject_id };

    // Filter by status if provided
    if (status) query.status = status;

    // Filter upcoming exams
    if (upcoming === "true") {
      query.exam_date = { $gte: new Date() };
    }

    const examinations = await Examination.find(query)
      .populate("class_id", "name section")
      .sort({ exam_date: 1, start_time: 1 });

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
    if (updateData.exam_date || updateData.start_time || updateData.end_time || updateData.class_id) {
      const currentExam = await Examination.findById(id);
      if (!currentExam) {
        return res.status(404).json({
          success: false,
          message: "Examination not found",
        });
      }

      const checkData = {
        class_id: updateData.class_id || currentExam.class_id,
        exam_date: updateData.exam_date || currentExam.exam_date,
        start_time: updateData.start_time || currentExam.start_time,
        end_time: updateData.end_time || currentExam.end_time,
        room_number: updateData.room_number || currentExam.room_number,
      };

      // Check for class conflicts
      const classConflict = await Examination.findOne({
        _id: { $ne: id },
        class_id: checkData.class_id,
        exam_date: checkData.exam_date,
        $or: [{ start_time: { $lt: checkData.end_time }, end_time: { $gt: checkData.start_time } }],
      });

      if (classConflict) {
        return res.status(400).json({
          success: false,
          message: "Scheduling conflict: Another exam is scheduled for this class at the same time",
        });
      }

      // Check for room conflicts if room is specified
      if (checkData.room_number) {
        const roomConflict = await Examination.findOne({
          _id: { $ne: id },
          room_number: checkData.room_number,
          exam_date: checkData.exam_date,
          $or: [{ start_time: { $lt: checkData.end_time }, end_time: { $gt: checkData.start_time } }],
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
    }).populate(["class_id", "subject_id"]);

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
    await Grade.deleteMany({ examination_id: req.params.id });

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
    ).populate(["class_id", "subject_id"]);

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

// Get examination statistics
exports.getExaminationStats = async (req, res) => {
  try {
    const totalExams = await Examination.countDocuments();

    const examsByStatus = await Examination.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const examsByType = await Examination.aggregate([{ $group: { _id: "$exam_type", count: { $sum: 1 } } }]);

    const upcomingExams = await Examination.countDocuments({
      exam_date: { $gte: new Date() },
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
      .populate("class_id", "name section")
      .populate("subject_id", "name code");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    const results = await Grade.find({ examination_id: id })
      .populate("student_id", "name email roll_number")
      .sort({ marks_obtained: -1 });

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
