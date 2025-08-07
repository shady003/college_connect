import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import authRoute from "./routes/auth.route.js";
import groupRoute from "./routes/group.route.js";
import eventRoute from "./routes/event.route.js";
import resourceRoute from "./routes/resource.route.js";
import announcementRoute from "./routes/announcement.route.js";
import adminRoute from "./routes/admin.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import Message from "./models/message.model.js";

dotenv.config();
import createError from "./utils/createError.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        console.log("Connected to MongoDB");
    } catch (e) {
        console.log("MongoDB connection error:", e);
        process.exit(1);
    }
};

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/groups', groupRoute);
app.use('/api/events', eventRoute);
app.use('/api/resources', resourceRoute);
app.use('/api/announcements', announcementRoute);
app.use('/api/admin', adminRoute);
import messageRoute from "./routes/message.route.js";
import userRoute from "./routes/user.route.js";
app.use('/api/messages', messageRoute);
app.use('/api/users', userRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Test auth endpoint
import { verifyToken } from "./middleware/verifyToken.js";
app.get('/api/test-auth', verifyToken, (req, res) => {
  res.json({ message: 'Auth working', user: req.user });
});

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessege = err.message || "Something went wrong !"
    return res.status(errorStatus).send(errorMessege);
})

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Store user socket mappings
const userSockets = new Map();

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user authentication
    socket.on("authenticate", (userId) => {
        socket.userId = userId;
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    socket.on("joinGroup", async (groupId) => {
        try {
            // Verify user is a member of the group
            if (socket.userId) {
                const Group = await import('./models/group.model.js').then(mod => mod.default);
                const group = await Group.findById(groupId);
                if (group) {
                    const isMember = group.members.some(member => member.user.toString() === socket.userId);
                    if (isMember) {
                        socket.join(groupId);
                        console.log(`Socket ${socket.id} (User: ${socket.userId}) joined group ${groupId}`);
                    } else {
                        console.log(`User ${socket.userId} is not a member of group ${groupId}`);
                    }
                }
            }
        } catch (error) {
            console.error("Error joining group:", error);
        }
    });

    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
        console.log(`Socket ${socket.id} left group ${groupId}`);
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            userSockets.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected`);
        }
        console.log("Client disconnected:", socket.id);
    });
});

// Export io for use in message controller
export { io };

const startServer = async () => {
    try {
        await connectDB();
        server.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (e) {
        console.error("Failed to start server:", e);
        process.exit(1);
    }
};

startServer();

// Make io available globally for message broadcasting
global.io = io;
