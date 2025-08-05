import mongoose from 'mongoose';
import Group from './models/group.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestGroup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a test public group
    const testGroup = new Group({
      name: 'Test Public Group',
      description: 'This is a test public group for testing visibility',
      category: 'Academic',
      creator: new mongoose.Types.ObjectId(), // Dummy creator ID
      members: [{
        user: new mongoose.Types.ObjectId(),
        role: 'admin',
        joinedAt: new Date()
      }],
      isPrivate: false,
      tags: ['test', 'public'],
      rules: ['Be respectful', 'No spam'],
      maxMembers: 50
    });

    await testGroup.save();
    console.log('Test group created:', testGroup);

    // Check all groups
    const allGroups = await Group.find({});
    console.log('All groups in database:', allGroups.length);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

createTestGroup();