import express from "express";
import { getMessagesByGroup, sendMessageToGroup, deleteMessage } from "../controller/message.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.get("/group/:groupId", getMessagesByGroup);
router.post("/group/:groupId", sendMessageToGroup);
router.delete("/:messageId", deleteMessage);

export default router;
