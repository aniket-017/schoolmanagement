const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolmanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('../models/Student');
const Class = require('../models/Class');

async function testStudents() {
  try {
    const classId = '688304c478c94861ce4ceeae';
    
    console.log('Testing students for class:', classId);
    
    // Check if class exists
    const classData = await Class.findById(classId);
    console.log('Class data:', classData ? {
      _id: classData._id,
      grade: classData.grade,
      division: classData.division,
      currentStrength: classData.currentStrength,
      maxStudents: classData.maxStudents
    } : 'Class not found');
    
    // Check all students in this class
    const students = await Student.find({ class: classId });
    console.log('Total students found:', students.length);
    
    // Check active students only
    const activeStudents = await Student.find({ 
      class: classId, 
      isActive: true 
    });
    console.log('Active students found:', activeStudents.length);
    
    // Show student details
    if (activeStudents.length > 0) {
      console.log('Student details:');
      activeStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.firstName} ${student.lastName} - Roll: ${student.rollNumber} - Active: ${student.isActive}`);
      });
    } else {
      console.log('No active students found in this class');
      
      // Check if there are any inactive students
      const inactiveStudents = await Student.find({ 
        class: classId, 
        isActive: false 
      });
      console.log('Inactive students found:', inactiveStudents.length);
      
      if (inactiveStudents.length > 0) {
        console.log('Inactive student details:');
        inactiveStudents.forEach((student, index) => {
          console.log(`${index + 1}. ${student.firstName} ${student.lastName} - Roll: ${student.rollNumber} - Active: ${student.isActive}`);
        });
      }
    }
    
    // Check all students in the database
    const allStudents = await Student.find({});
    console.log('Total students in database:', allStudents.length);
    
    // Check students with this class ID regardless of active status
    const allClassStudents = await Student.find({ class: classId });
    console.log('All students in this class (including inactive):', allClassStudents.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStudents(); 