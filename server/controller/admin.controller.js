import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Resource from "../models/resource.model.js";
import Announcement from "../models/announcement.model.js";
import jwt from "jsonwebtoken";

const ADMIN_KEY = process.env.ADMIN_PASS || "COLLEGE_CONNECT_ADMIN_2024";

export const register = async (req, res) => {
  try {
    const { username, email, password, adminKey } = req.body;

    if (adminKey !== ADMIN_KEY) {
      return res.status(400).json({ message: "Invalid admin key" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      username,
      email,
      password,
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(400).json({ message: "Admin account is deactivated" });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    console.log("Fetching admin stats...");
    const [totalUsers, totalGroups, totalResources, totalAnnouncements] = await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      Resource.countDocuments(),
      Announcement.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalGroups,
      totalResources,
      totalAnnouncements,
    };
    
    console.log("Admin stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email createdAt");

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name category members createdAt")
      .populate("members.user", "username");

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await Group.findByIdAndDelete(groupId);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users for admin...");
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("username email profile_pic createdAt");
    console.log(`Found ${users.length} users`);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .sort({ createdAt: -1 })
      .populate("creator", "username")
      .populate("members.user", "username");
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate("creator", "username");
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("author", "username");
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    await Resource.findByIdAndDelete(resourceId);
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    await Announcement.findByIdAndDelete(announcementId);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const Event = await import('../models/event.model.js').then(mod => mod.default);
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("organizer", "username");
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const Event = await import('../models/event.model.js').then(mod => mod.default);
    await Event.findByIdAndDelete(eventId);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const updatedGroup = await Group.findByIdAndUpdate(groupId, req.body, { new: true });
    res.json({ group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const updatedResource = await Resource.findByIdAndUpdate(resourceId, req.body, { new: true });
    res.json({ resource: updatedResource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const Event = await import('../models/event.model.js').then(mod => mod.default);
    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
    res.json({ event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(announcementId, req.body, { new: true });
    res.json({ announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const Event = await import('../models/event.model.js').then(mod => mod.default);
    const User = await import('../models/user.model.js').then(mod => mod.default);
    
    // Find or create a system admin user
    let adminUser = await User.findOne({ email: 'admin@system.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'System Admin',
        email: 'admin@system.com',
        password: 'admin123',
        college_name: 'System',
        role: 'admin'
      });
      await adminUser.save();
    }
    
    const { title, description, date, location, category } = req.body;
    const event = new Event({
      title,
      description,
      startDate: date,
      endDate: date,
      location: { type: 'Physical', address: location },
      category,
      organizer: adminUser._id,
    });
    await event.save();
    res.status(201).json({ event, message: "Event created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      author: req.admin._id,
    });
    await announcement.save();
    res.status(201).json({ announcement, message: "Announcement created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};