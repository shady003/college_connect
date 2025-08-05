import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Academic', 'Social', 'Technical', 'Sports', 'Cultural', 'Other']
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: { 
      type: String, 
      enum: ['admin', 'moderator', 'member'], 
      default: 'member' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
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
  rules: [{ 
    type: String 
  }],
  maxMembers: { 
    type: Number, 
    default: 100 
  },
  joinRequests: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    requestedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, {
  timestamps: true
});

// Index for search functionality
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model("Group", groupSchema); 