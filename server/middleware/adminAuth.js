import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    console.log("Verifying admin token...");
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);
    
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    if (decoded.role !== "admin") {
      console.log("Not admin role:", decoded.role);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      console.log("Admin not found or inactive");
      return res.status(401).json({ message: "Invalid token or admin account deactivated." });
    }

    console.log("Admin verified:", admin.username);
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};