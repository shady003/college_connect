import express from "express";
import { 
  createAnnouncement, 
  getAnnouncements, 
  getAnnouncement, 
  addComment,
  updateAnnouncement, 
  deleteAnnouncement,
  getUnreadCount
} from "../controller/announcement.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// All announcement routes require authentication
router.use(verifyToken);

// Announcement CRUD operations
router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
router.get("/unread-count", getUnreadCount);
router.get("/:id", getAnnouncement);
router.post("/:id/comment", addComment);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router; 