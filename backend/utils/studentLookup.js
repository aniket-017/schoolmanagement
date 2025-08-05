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

    // For students that only exist in Student model, find or create corresponding User record
    let userRecord = null;

    if (isStudentModel) {
      // Try to find corresponding User record by studentId or email
      if (student.studentId) {
        userRecord = await User.findOne({ studentId: student.studentId });
      }

      if (!userRecord && student.email) {
        userRecord = await User.findOne({ email: student.email });
      }

      if (!userRecord && student.rollNumber) {
        userRecord = await User.findOne({ studentId: student.rollNumber });
      }

      // If no User record exists, create one
      if (!userRecord) {
        try {
          userRecord = await User.create({
            name: student.name || `${student.firstName} ${student.lastName}`.trim(),
            email: student.email || `student.${student.studentId || student.rollNumber}@school.com`,
            password: "tempPassword123", // This should be changed by the student
            role: "student",
            class: student.class,
            studentId: student.studentId || student.rollNumber,
            phone: student.mobileNumber,
          });
          console.log(
            `Created new User record for student: ${student.name || student.firstName} (User ID: ${userRecord._id})`
          );
        } catch (error) {
          console.error("Error creating User record for student:", error);
          throw new Error("Error creating user record for student");
        }
      }
    }

    return {
      found: true,
      student,
      isStudentModel,
      userRecord: isStudentModel ? userRecord : student,
    };
  } catch (error) {
    console.error("Error in findStudentById:", error);
    throw error;
  }
};

module.exports = {
  findStudentById,
};
