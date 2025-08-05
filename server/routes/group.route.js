import express from "express";
import Group from "../models/group.model.js";
import { 
  createGroup, 
  getGroups, 
  getGroup, 
  joinGroup, 
  leaveGroup, 
  updateGroup, 
  deleteGroup,
  approveJoinRequest,
  rejectJoinRequest,
  getJoinRequests,
  getUserGroups,
  discoverGroups
} from "../controller/group.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/public", async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate("creator", "username")
      .populate("members.user", "username")
      .select("-joinRequests")
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});
router.get("/discover", discoverGroups);

// Semi-public route (shows user status if authenticated)
router.get("/", getGroups);

// Protected routes (auth required)
router.post("/", verifyToken, createGroup);
router.get("/user/joined", verifyToken, getUserGroups);
router.get("/:id", verifyToken, getGroup);
router.post("/:id/join", verifyToken, joinGroup);
router.post("/:id/leave", verifyToken, leaveGroup);
router.put("/:id", verifyToken, updateGroup);
router.delete("/:id", verifyToken, deleteGroup);
router.post("/:groupId/approve/:userId", verifyToken, approveJoinRequest);
router.post("/:groupId/reject/:userId", verifyToken, rejectJoinRequest);
router.get("/:id/join-requests", verifyToken, getJoinRequests);


export default router;
