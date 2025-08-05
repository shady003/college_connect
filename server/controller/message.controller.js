import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import createError from "../utils/createError.js";

// Get messages by group ID
export const getMessagesByGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?.id || req.query.userId;
    
    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    const isMember = group.members.some(member => member.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a member to view group messages" });
    }
    
    const messages = await Message.find({ group: groupId })
      .populate("sender", "username profile_pic")
      .sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    console.error("Get messages error:", err.message, err.stack);
    next(createError(500, "Failed to fetch messages"));
  }
};

// Send message to group
export const sendMessageToGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?.id || req.body.userId;
    const { content, messageType = 'text', attachments = [] } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    const isMember = group.members.some(member => member.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a member to send messages to this group" });
    }
    
    const newMessage = new Message({
      sender: userId,
      group: groupId,
      content: content.trim(),
      messageType,
      attachments
    });
    
    await newMessage.save();
    
    // Populate sender info for response
    await newMessage.populate("sender", "username profile_pic");
    
    // Broadcast message to group members via Socket.IO
    if (global.io) {
      global.io.to(groupId).emit("newMessage", newMessage);
    }
    
    res.status(201).json({ 
      message: "Message sent successfully", 
      data: newMessage 
    });
  } catch (err) {
    console.error("Send message error:", err.message, err.stack);
    next(createError(500, "Failed to send message"));
  }
};

// Delete message (only by sender)
export const deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user?.id;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    // Broadcast deletion to group members via Socket.IO
    if (global.io && message.group) {
      global.io.to(message.group.toString()).emit("messageDeleted", messageId);
    }
    
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err.message, err.stack);
    next(createError(500, "Failed to delete message"));
  }
};
