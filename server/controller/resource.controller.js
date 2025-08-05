import Resource from "../models/resource.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import createError from "../utils/createError.js";

// Create a new resource
export const createResource = async (req, res, next) => {
  try {
    const { title, fileUrl } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ 
        message: "Title and file URL are required" 
      });
    }

    const newResource = new Resource({
      title,
      fileUrl,
      creator: req.user.id
    });

    await newResource.save();
    await newResource.populate('creator', 'username');

    res.status(201).json({
      message: "Resource shared successfully",
      resource: newResource
    });

  } catch (err) {
    console.error("Create resource error:", err);
    next(createError(500, "Failed to share resource"));
  }
};

// Get all resources
export const getResources = async (req, res, next) => {
  try {
    const { category, subject, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ resources });

  } catch (err) {
    console.error("Get resources error:", err);
    next(createError(500, "Failed to fetch resources"));
  }
};

// Get resource by ID
export const getResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id)
      .populate('creator', 'username');

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({ resource });

  } catch (err) {
    console.error("Get resource error:", err);
    next(createError(500, "Failed to fetch resource"));
  }
};

// Download a resource
export const downloadResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.status(200).json({ 
      message: "Download successful",
      downloadUrl: resource.fileUrl,
      resource 
    });

  } catch (err) {
    console.error("Download resource error:", err);
    next(createError(500, "Failed to download resource"));
  }
};

// Like/Unlike a resource
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const likeIndex = resource.likes.indexOf(req.user.id);
    
    if (likeIndex > -1) {
      // Unlike
      resource.likes.splice(likeIndex, 1);
    } else {
      // Like
      resource.likes.push(req.user.id);
    }

    await resource.save();

    console.log(`User ${req.user.username} ${likeIndex > -1 ? 'unliked' : 'liked'} resource ${resource.title}`);

    res.status(200).json({ 
      message: likeIndex > -1 ? "Resource unliked" : "Resource liked",
      resource 
    });

  } catch (err) {
    console.error("Toggle like error:", err);
    next(createError(500, "Failed to toggle like"));
  }
};

// Rate a resource
export const rateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if user has already rated
    const existingRating = resource.rating.ratings.find(r => 
      r.user.toString() === req.user.id
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.createdAt = new Date();
    } else {
      // Add new rating
      resource.rating.ratings.push({
        user: req.user.id,
        rating,
        createdAt: new Date()
      });
    }

    // Recalculate average rating
    const totalRating = resource.rating.ratings.reduce((sum, r) => sum + r.rating, 0);
    resource.rating.average = totalRating / resource.rating.ratings.length;
    resource.rating.count = resource.rating.ratings.length;

    await resource.save();

    console.log(`User ${req.user.username} rated resource ${resource.title} with ${rating} stars`);

    res.status(200).json({ 
      message: "Rating submitted successfully",
      resource 
    });

  } catch (err) {
    console.error("Rate resource error:", err);
    next(createError(500, "Failed to rate resource"));
  }
};

// Add comment to resource
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    resource.comments.push({
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    });

    await resource.save();
    await resource.populate('comments.user', 'username college_name');

    console.log(`User ${req.user.username} commented on resource ${resource.title}`);

    res.status(200).json({ 
      message: "Comment added successfully",
      resource 
    });

  } catch (err) {
    console.error("Add comment error:", err);
    next(createError(500, "Failed to add comment"));
  }
};

// Update resource (author only)
export const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if user is the author or admin
    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only the author or admin can update the resource" });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'category', 'subject', 'tags', 
      'isPublic', 'version', 'language'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        resource[field] = updates[field];
      }
    });

    await resource.save();

    console.log(`Resource ${resource.title} updated by ${req.user.username}`);

    res.status(200).json({ 
      message: "Resource updated successfully",
      resource 
    });

  } catch (err) {
    console.error("Update resource error:", err);
    next(createError(500, "Failed to update resource"));
  }
};

// Delete resource (author only)
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if user is the author or admin
    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only the author or admin can delete the resource" });
    }

    await Resource.findByIdAndDelete(id);

    console.log(`Resource ${resource.title} deleted by ${req.user.username}`);

    res.status(200).json({ 
      message: "Resource deleted successfully" 
    });

  } catch (err) {
    console.error("Delete resource error:", err);
    next(createError(500, "Failed to delete resource"));
  }
};

// Get user's resources
export const getUserResources = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const resources = await Resource.find({ creator: userId })
      .populate('creator', 'username college_name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments({ author: userId });

    res.status(200).json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error("Get user resources error:", err);
    next(createError(500, "Failed to fetch user resources"));
  }
}; 