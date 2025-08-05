import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
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
    enum: ['Academic', 'Technical', 'Career', 'Personal', 'General', 'Other']
  },
  subject: { 
    type: String 
  },
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['Open', 'Answered', 'Closed'], 
    default: 'Open' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  upvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  downvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  answers: [{
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    isAccepted: { 
      type: Boolean, 
      default: false 
    },
    upvotes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    downvotes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  attachments: [{
    title: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  mentorAssigned: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  resolvedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Index for search and filtering
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ category: 1, status: 1, createdAt: -1 });
questionSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("Question", questionSchema); 