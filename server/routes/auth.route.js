import express from "express";
import { login, register, logout, getProfile } from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getProfile);

export default router;