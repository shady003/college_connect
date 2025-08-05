import express from "express";
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  attendEvent, 
  updateEvent, 
  deleteEvent,
  getUserEvents
} from "../controller/event.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// All event routes require authentication
router.use(verifyToken);

// Event CRUD operations
router.post("/", verifyAdmin, createEvent);
router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/:id/attend", attendEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// User events
router.get("/user/:userId", getUserEvents);

export default router;
