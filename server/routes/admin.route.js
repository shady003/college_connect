import express from "express";
import {
  register,
  login,
  getStats,
  getRecentUsers,
  getRecentGroups,
  deleteUser,
  deleteGroup,
  getAllUsers,
  getAllGroups,
  getAllResources,
  getAllAnnouncements,
  getAllEvents,
  deleteResource,
  deleteAnnouncement,
  deleteEvent,
  updateUser,
  updateGroup,
  updateResource,
  updateEvent,
  updateAnnouncement,
  createEvent,
  createAnnouncement,
} from "../controller/admin.controller.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/stats", verifyAdminToken, getStats);
router.get("/users/recent", verifyAdminToken, getRecentUsers);
router.get("/groups/recent", verifyAdminToken, getRecentGroups);
router.get("/users", verifyAdminToken, getAllUsers);
router.get("/groups", verifyAdminToken, getAllGroups);
router.get("/resources", verifyAdminToken, getAllResources);
router.get("/announcements", verifyAdminToken, getAllAnnouncements);
router.get("/events", verifyAdminToken, getAllEvents);
router.delete("/users/:userId", verifyAdminToken, deleteUser);
router.delete("/groups/:groupId", verifyAdminToken, deleteGroup);
router.delete("/resources/:resourceId", verifyAdminToken, deleteResource);
router.delete("/announcements/:announcementId", verifyAdminToken, deleteAnnouncement);
router.delete("/events/:eventId", verifyAdminToken, deleteEvent);
router.put("/users/:userId", verifyAdminToken, updateUser);
router.put("/groups/:groupId", verifyAdminToken, updateGroup);
router.put("/resources/:resourceId", verifyAdminToken, updateResource);
router.put("/events/:eventId", verifyAdminToken, updateEvent);
router.put("/announcements/:announcementId", verifyAdminToken, updateAnnouncement);
router.post("/events", verifyAdminToken, createEvent);
router.post("/announcements", verifyAdminToken, createAnnouncement);

export default router;