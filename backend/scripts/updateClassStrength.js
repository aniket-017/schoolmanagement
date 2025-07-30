const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://latakhillare:LtmZBL4ZiJiZ3hs0@cluster0.impfvlk.mongodb.net/schoolmanagment?retryWrites=true&w=majority');

const Class = require('../models/Class');

async function updateClassStrength() {
  try {
    console.log('🔄 Updating class strength to 0...\n');

    // First, let's see what we have
    const classes = await Class.find({});
    console.log(`📊 Found ${classes.length} classes`);
    
    classes.forEach(cls => {
      console.log(`   Class: ${cls.grade}${cls.division} - Current Strength: ${cls.currentStrength || 0}`);
    });

    // Update all classes to have currentStrength = 0
    const result = await Class.updateMany(
      {}, // Update all classes
      { currentStrength: 0 }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} classes`);
    console.log('🎉 All classes now have currentStrength = 0');

    // Verify the update
    const updatedClasses = await Class.find({});
    console.log('\n📊 Updated class data:');
    updatedClasses.forEach(cls => {
      console.log(`   Class: ${cls.grade}${cls.division} - Current Strength: ${cls.currentStrength}`);
    });

  } catch (error) {
    console.error('❌ Error updating class strength:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateClassStrength(); 