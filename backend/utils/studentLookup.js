const User = require("../models/User");
const Student = require("../models/Student");

/**
 * Find a student by ID, checking both User and Student models
 * @param {string} studentId - The student ID to look up
 * @returns {Object} - Object containing student data and metadata
 */
const findStudentById = async (studentId) => {
  try {
    // First try to find in User model
    let student = await User.findById(studentId);
    let isStudentModel = false;

    if (!student || student.role !== "student") {
      // Try to find in Student model
      student = await Student.findById(studentId);
      isStudentModel = true;

      if (!student) {
        return {
          found: false,
          student: null,
          isStudentModel: false,
          userRecord: null,
        };
      }
    }

    // For students that only exist in Student model, we don't create User records
    // Students are managed separately in the Student database
    let userRecord = null;

    if (isStudentModel) {
      // Students exist only in Student model, no User record needed
      // Set userRecord to the student object itself for consistency
      userRecord = student;
    }

    return {
      found: true,
      student,
      isStudentModel,
      userRecord: userRecord,
    };
  } catch (error) {
    console.error("Error in findStudentById:", error);
    throw error;
  }
};

module.exports = {
  findStudentById,
};
