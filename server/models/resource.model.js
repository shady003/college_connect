import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  creator: { 
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
    default: 'Other'
  },
  subject: { 
    type: String, 
    default: 'General' 
  },
  type: { 
    type: String, 
    default: 'File'
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number 
  },
  fileType: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  downloads: { 
    type: Number, 
    default: 0 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    text: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  rating: {
    average: { 
      type: Number, 
      default: 0 
    },
    count: { 
      type: Number, 
      default: 0 
    },
    ratings: [{
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      rating: { 
        type: Number, 
        min: 1, 
        max: 5 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  version: { 
    type: String, 
    default: '1.0' 
  },
  language: { 
    type: String, 
    default: 'English' 
  }
}, {
  timestamps: true
});

// Index for search functionality
resourceSchema.index({ title: 'text', description: 'text', tags: 'text', subject: 'text' });

export default mongoose.model("Resource", resourceSchema); 