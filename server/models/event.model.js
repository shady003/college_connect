import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Workshop', 'Seminar', 'Meetup', 'Competition', 'Cultural', 'Sports', 'Other']
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Physical', 'Virtual', 'Hybrid'], 
      default: 'Physical' 
    },
    address: { 
      type: String 
    },
    virtualLink: { 
      type: String 
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  attendees: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    status: { 
      type: String, 
      enum: ['going', 'maybe', 'not_going'], 
      default: 'going' 
    },
    registeredAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  maxAttendees: { 
    type: Number 
  },
  isPrivate: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: String 
  }],
  coverImage: { 
    type: String 
  },
  requirements: [{ 
    type: String 
  }],
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['document', 'video', 'link'] }
  }]
}, {
  timestamps: true
});

// Index for search and date queries
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Event", eventSchema); 