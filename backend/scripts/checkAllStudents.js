const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolmanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('../models/Student');
const Class = require('../models/Class');

async function checkAllStudents() {
  try {
    console.log('Checking all students in database...');
    
    // Get all students
    const allStudents = await Student.find({});
    console.log('Total students in database:', allStudents.length);
    
    if (allStudents.length > 0) {
      console.log('\nStudent details:');
      for (let i = 0; i < allStudents.length; i++) {
        const student = allStudents[i];
        console.log(`${i + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`   - ID: ${student._id}`);
        console.log(`   - Email: ${student.email}`);
        console.log(`   - Roll Number: ${student.rollNumber}`);
        console.log(`   - Class: ${student.class}`);
        console.log(`   - Active: ${student.isActive}`);
        console.log(`   - Grade: ${student.grade}`);
        console.log('   ---');
      }
    }
    
    // Get all classes
    const allClasses = await Class.find({});
    console.log('\nAll classes in database:', allClasses.length);
    
    if (allClasses.length > 0) {
      console.log('\nClass details:');
      for (let i = 0; i < allClasses.length; i++) {
        const classData = allClasses[i];
        console.log(`${i + 1}. ${classData.grade}${classData.getOrdinalSuffix(classData.grade)} - ${classData.division}`);
        console.log(`   - ID: ${classData._id}`);
        console.log(`   - Current Strength: ${classData.currentStrength}`);
        console.log(`   - Max Students: ${classData.maxStudents}`);
        console.log('   ---');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAllStudents(); 