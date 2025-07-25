const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolmanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('../models/Student');
const Class = require('../models/Class');

async function moveStudentToClass() {
  try {
    const targetClassId = '688304c478c94861ce4ceeae'; // 1st A class
    const studentId = '6883037178c94861ce4cedae'; // monika Takalkar
    
    console.log('Moving student to class...');
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      console.log('Student not found');
      return;
    }
    
    console.log('Student found:', student.firstName, student.lastName);
    console.log('Current class:', student.class);
    
    // Check if target class exists
    const targetClass = await Class.findById(targetClassId);
    if (!targetClass) {
      console.log('Target class not found');
      return;
    }
    
    console.log('Target class found:', targetClass.grade + targetClass.getOrdinalSuffix(targetClass.grade), targetClass.division);
    
    // Update student's class
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { 
        class: targetClassId,
        grade: `${targetClass.grade}${targetClass.getOrdinalSuffix(targetClass.grade)}`
      },
      { new: true }
    );
    
    console.log('Student updated successfully');
    console.log('New class:', updatedStudent.class);
    console.log('New grade:', updatedStudent.grade);
    
    // Update class current strength
    const studentsInClass = await Student.find({ 
      class: targetClassId, 
      isActive: true 
    });
    
    await Class.findByIdAndUpdate(targetClassId, {
      currentStrength: studentsInClass.length
    });
    
    console.log('Class current strength updated to:', studentsInClass.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

moveStudentToClass(); 