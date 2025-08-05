import mongoose from 'mongoose';
import Group from './server/models/group.model.js';
import Event from './server/models/event.model.js';
import Resource from './server/models/resource.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const groups = await Group.find({});
    console.log('Groups in database:', groups.length);
    
    const events = await Event.find({});
    console.log('Events in database:', events.length);
    
    const resources = await Resource.find({});
    console.log('Resources in database:', resources.length);
    
    if (groups.length === 0) {
      console.log('Creating sample group...');
      const sampleGroup = new Group({
        name: 'Sample Study Group',
        description: 'A sample group for testing',
        category: 'Academic',
        isPrivate: false,
        creator: new mongoose.Types.ObjectId(),
        members: [{
          user: new mongoose.Types.ObjectId(),
          role: 'admin',
          joinedAt: new Date()
        }],
        tags: ['study', 'test'],
        maxMembers: 50
      });
      await sampleGroup.save();
      console.log('Sample group created');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

checkData();