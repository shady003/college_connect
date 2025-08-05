import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

// Create a group
export const createGroup = async (req, res, next) => {
  try {
    const { name, description, category, isPrivate, tags, rules, maxMembers } = req.body;
    const creatorId = req.user.id;

    const newGroup = new Group({
      name,
      description,
      category,
      isPrivate,
      tags,
      rules,
      maxMembers,
      creator: creatorId,
      members: [{ user: creatorId, role: "admin", joinedAt: new Date() }],
      joinRequests: [],
    });

    await newGroup.save();

    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (err) {
    console.error("Create group error:", err.message, err.stack);
    next(createError(500, "Failed to create group"));
  }
};

// Get all groups (both public and private for authenticated users)
export const getGroups = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { search, category } = req.query;
    
    // Show all groups if authenticated, only public if not
    let query = userId ? {} : { isPrivate: false };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const groups = await Group.find(query)
      .populate("creator", "username")
      .populate("members.user", "username")
      .select("-joinRequests")
      .sort({ createdAt: -1 });
    
    // Add membership status for each group if user is authenticated
    const groupsWithStatus = groups.map(group => {
      const isMember = userId ? group.members.some(member => member.user._id.toString() === userId) : false;
      const isCreator = userId ? group.creator._id.toString() === userId : false;
      
      return {
        ...group.toObject(),
        userStatus: {
          isMember,
          isCreator,
          canJoin: userId && !isMember && !isCreator
        }
      };
    });
    
    res.status(200).json({ groups: groupsWithStatus });
  } catch (err) {
    next(createError(500, "Failed to fetch groups"));
  }
};

// Get a specific group
export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "username")
      .populate("members.user", "username");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (err) {
    next(createError(500, "Failed to fetch group"));
  }
};

// Update group (e.g., name, description)
export const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the creator can update the group" });
    }

    group.name = req.body.name || group.name;
    group.description = req.body.description || group.description;

    await group.save();

    res.status(200).json({ message: "Group updated successfully", group });
  } catch (err) {
    next(createError(500, "Failed to update group"));
  }
};

// Delete group
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the creator can delete the group" });
    }

    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    next(createError(500, "Failed to delete group"));
  }
};

// Join group (direct join for public groups, request for private)
export const joinGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: "Already a member of this group" });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "Group is at maximum capacity" });
    }

    // For public groups, join directly
    if (!group.isPrivate) {
      group.members.push({ user: userId, role: "member", joinedAt: new Date() });
      await group.save();
      return res.status(200).json({ message: "Successfully joined the group!" });
    }

    // For private groups, send join request
    const alreadyRequested = group.joinRequests?.some(req => req.user.toString() === userId);
    if (alreadyRequested) {
      return res.status(400).json({ message: "Join request already sent" });
    }

    group.joinRequests.push({ user: userId, requestedAt: new Date() });
    await group.save();

    res.status(200).json({ message: "Join request sent, awaiting approval" });
  } catch (err) {
    next(createError(500, "Failed to join group"));
  }
};

// Leave group
export const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(m => m.user.toString() !== req.user.id);
    await group.save();

    res.status(200).json({ message: "Left the group successfully" });
  } catch (err) {
    next(createError(500, "Failed to leave group"));
  }
};

// Approve join request (only creator or admin can approve)
export const approveJoinRequest = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const user = req.user;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator or admin can approve
    if (group.creator.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can approve join requests" });
    }

    const requestIndex = group.joinRequests.findIndex(req => req.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found" });
    }

    group.members.push({ user: userId, role: "member", joinedAt: new Date() });
    group.joinRequests.splice(requestIndex, 1);
    await group.save();

    res.status(200).json({ message: "Join request approved", group });
  } catch (err) {
    next(createError(500, "Failed to approve join request"));
  }
};

// Reject join request (only creator or admin can reject)
export const rejectJoinRequest = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const user = req.user;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator or admin can reject
    if (group.creator.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can reject join requests" });
    }

    const requestIndex = group.joinRequests.findIndex(req => req.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found" });
    }

    group.joinRequests.splice(requestIndex, 1);
    await group.save();

    res.status(200).json({ message: "Join request rejected", group });
  } catch (err) {
    next(createError(500, "Failed to reject join request"));
  }
};

// Get join requests for a group (for creator dashboard)
export const getJoinRequests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id)
      .populate("joinRequests.user", "username email")
      .populate("creator", "username");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator or admin can view join requests
    if (group.creator._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can view join requests" });
    }

    res.status(200).json({ 
      groupName: group.name,
      joinRequests: group.joinRequests 
    });
  } catch (err) {
    next(createError(500, "Failed to fetch join requests"));
  }
};

// Get user's joined groups (for dashboard)
export const getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const groups = await Group.find({
      $or: [
        { "members.user": userId },
        { creator: userId }
      ]
    })
    .populate("creator", "username")
    .populate("members.user", "username")
    .select("-joinRequests")
    .sort({ createdAt: -1 });
    
    res.status(200).json(groups);
  } catch (err) {
    next(createError(500, "Failed to fetch user groups"));
  }
};

// Discover all groups (for explore page)
export const discoverGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category } = req.query;
    
    // Build query - show all public groups
    let query = { isPrivate: false };
    
    // Add search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const groups = await Group.find(query)
      .populate("creator", "username")
      .populate("members.user", "username")
      .select("-joinRequests")
      .sort({ createdAt: -1 });
    
    // Add membership status for each group
    const groupsWithStatus = groups.map(group => {
      const isMember = group.members.some(member => member.user._id.toString() === userId);
      const isCreator = group.creator._id.toString() === userId;
      
      return {
        ...group.toObject(),
        userStatus: {
          isMember,
          isCreator,
          canJoin: !isMember && !isCreator
        }
      };
    });
    
    res.status(200).json({ groups: groupsWithStatus });
  } catch (err) {
    next(createError(500, "Failed to discover groups"));
  }
};
