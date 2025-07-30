const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://latakhillare:LtmZBL4ZiJiZ3hs0@cluster0.impfvlk.mongodb.net/schoolmanagment?retryWrites=true&w=majority');

const Student = require('../models/Student');
const Class = require('../models/Class');

async function fixClassStrength() {
  try {
    console.log('🔧 Fixing class strength based on actual student count...\n');

    // Get all classes
    const classes = await Class.find({});
    console.log(`📊 Found ${classes.length} classes`);

    // Count students for each class and update currentStrength
    for (const classItem of classes) {
      const studentCount = await Student.countDocuments({ 
        class: classItem._id,
        isActive: true 
      });
      
      console.log(`   Class: ${classItem.grade}${classItem.division} - Current Strength: ${classItem.currentStrength} - Actual Students: ${studentCount}`);
      
      // Update class strength to match actual student count
      await Class.findByIdAndUpdate(classItem._id, {
        currentStrength: studentCount
      });
    }

    console.log('\n✅ Updated all class strengths to match actual student counts');
    
    // Verify the updates
    const updatedClasses = await Class.find({});
    console.log('\n📊 Updated class data:');
    updatedClasses.forEach(cls => {
      console.log(`   Class: ${cls.grade}${cls.division} - Current Strength: ${cls.currentStrength}`);
    });

    // Show total students
    const totalStudents = await Student.countDocuments({ isActive: true });
    console.log(`\n🎯 Total active students in system: ${totalStudents}`);

  } catch (error) {
    console.error('❌ Error fixing class strength:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixClassStrength(); 