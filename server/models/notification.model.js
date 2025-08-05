import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'group_invite', 'group_join', 'group_message', 'event_invite', 'event_reminder',
      'resource_upload', 'question_answer', 'announcement', 'mentor_assigned',
      'like', 'comment', 'follow', 'mention', 'system'
    ]
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    url: { type: String }
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  expiresAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema); 