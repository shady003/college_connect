import express from "express";
import { 
  createResource, 
  getResources, 
  getResource, 
  downloadResource, 
  toggleLike,
  rateResource,
  addComment,
  updateResource, 
  deleteResource,
  getUserResources
} from "../controller/resource.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getResources);
router.get("/:id", getResource);
router.post("/:id/download", downloadResource);

// Protected routes
router.post("/", verifyToken, createResource);
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/rate", verifyToken, rateResource);
router.post("/:id/comment", verifyToken, addComment);
router.put("/:id", verifyToken, updateResource);
router.delete("/:id", verifyToken, deleteResource);
router.get("/user/:userId", verifyToken, getUserResources);

export default router; 