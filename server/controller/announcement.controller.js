import Announcement from "../models/announcement.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

// Create a new announcement (Admin/Teacher only)
export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      attachments,
      tags,
      allowComments,
      expiresAt
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: "Title, content, and category are required" 
      });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      category,
      author: req.user.id,
      priority: priority || 'Medium',
      targetAudience: targetAudience || { allStudents: true },
      attachments: attachments || [],
      tags: tags || [],
      allowComments: allowComments || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await newAnnouncement.save();
    await newAnnouncement.populate('author', 'username email college_name');

    console.log(`Announcement created: ${title} by ${req.user.username}`);

    res.status(201).json({
      message: "Announcement created successfully",
      announcement: newAnnouncement
    });

  } catch (err) {
    console.error("Create announcement error:", err);
    next(createError(500, "Failed to create announcement"));
  }
};

// Get all announcements (with filters)
export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by target audience
    const user = req.user;
    query.$or = [
      { 'targetAudience.allStudents': true },
      { 'targetAudience.specificBranches': user.branch },
      { 'targetAudience.specificYears': user.year }
    ];

    const announcements = await Announcement.find(query)
      .populate('author', 'username college_name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.status(200).json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error("Get announcements error:", err);
    next(createError(500, "Failed to fetch announcements"));
  }
};

// Get announcement by ID
export const getAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id)
      .populate('author', 'username email college_name')
      .populate('comments.user', 'username college_name');

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Mark as read
    const isRead = announcement.readBy.some(read => 
      read.user.toString() === req.user.id
    );

    if (!isRead) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await announcement.save();
    }

    res.status(200).json({ announcement });

  } catch (err) {
    console.error("Get announcement error:", err);
    next(createError(500, "Failed to fetch announcement"));
  }
};

// Add comment to announcement
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!announcement.allowComments) {
      return res.status(400).json({ message: "Comments are not allowed for this announcement" });
    }

    announcement.comments.push({
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    });

    await announcement.save();
    await announcement.populate('comments.user', 'username college_name');

    console.log(`User ${req.user.username} commented on announcement ${announcement.title}`);

    res.status(200).json({ 
      message: "Comment added successfully",
      announcement 
    });

  } catch (err) {
    console.error("Add comment error:", err);
    next(createError(500, "Failed to add comment"));
  }
};

// Update announcement (author only)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user is the author
    if (announcement.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the author can update the announcement" });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'content', 'category', 'priority', 'targetAudience', 
      'attachments', 'tags', 'allowComments', 'expiresAt', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        announcement[field] = updates[field];
      }
    });

    await announcement.save();

    console.log(`Announcement ${announcement.title} updated by ${req.user.username}`);

    res.status(200).json({ 
      message: "Announcement updated successfully",
      announcement 
    });

  } catch (err) {
    console.error("Update announcement error:", err);
    next(createError(500, "Failed to update announcement"));
  }
};

// Delete announcement (author only)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user is the author
    if (announcement.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the author can delete the announcement" });
    }

    await Announcement.findByIdAndDelete(id);

    console.log(`Announcement ${announcement.title} deleted by ${req.user.username}`);

    res.status(200).json({ 
      message: "Announcement deleted successfully" 
    });

  } catch (err) {
    console.error("Delete announcement error:", err);
    next(createError(500, "Failed to delete announcement"));
  }
};

// Get unread announcements count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Announcement.countDocuments({
      isActive: true,
      readBy: { $not: { $elemMatch: { user: req.user.id } } }
    });

    res.status(200).json({ unreadCount: count });

  } catch (err) {
    console.error("Get unread count error:", err);
    next(createError(500, "Failed to get unread count"));
  }
}; 