import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  content: { 
    type: String, 
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'link'], 
    default: 'text' 
  },
  attachments: [{
    url: { type: String },
    type: { type: String },
    name: { type: String },
    size: { type: Number }
  }],
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
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  editedAt: { 
    type: Date 
  },
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  reactions: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    emoji: { 
      type: String 
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema); 