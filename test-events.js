import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    type: { type: String, enum: ['Physical', 'Virtual', 'Hybrid'], default: 'Physical' },
    address: { type: String },
    virtualLink: { type: String }
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['going', 'maybe', 'not_going'], default: 'going' },
    registeredAt: { type: Date, default: Date.now }
  }],
  maxAttendees: { type: Number },
  isPrivate: { type: Boolean, default: false },
  tags: [{ type: String }],
  requirements: [{ type: String }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

async function checkEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const events = await Event.find().populate('organizer', 'username');
    console.log('Events found:', events.length);
    
    events.forEach(event => {
      console.log(`- ${event.title} (${event.category}) - Organizer: ${event.organizer?.username || 'Unknown'}`);
    });
    
    if (events.length === 0) {
      console.log('No events found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkEvents();