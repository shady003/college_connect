import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Exam', 'Holiday', 'Event', 'General', 'Academic', 'Cultural', 'Sports', 'Other']
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  targetAudience: {
    allStudents: { type: Boolean, default: true },
    specificBranches: [{ type: String }],
    specificYears: [{ type: String }],
    specificGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
  },
  attachments: [{
    title: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  expiresAt: { 
    type: Date 
  },
  readBy: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  tags: [{ 
    type: String 
  }],
  allowComments: { 
    type: Boolean, 
    default: false 
  },
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
  }]
}, {
  timestamps: true
});

// Index for search and filtering
announcementSchema.index({ title: 'text', content: 'text', tags: 'text' });
announcementSchema.index({ category: 1, createdAt: -1 });
announcementSchema.index({ priority: 1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema); 