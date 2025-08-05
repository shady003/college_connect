import express from "express";
import { updateUser, getUser } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);

export default router;