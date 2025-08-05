import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    // Extended registration logic with all required fields
    const {
      username,
      email,
      password,
      college_name,
      year,
      branch,
      course,
      rollno,
      contact,
      skills,
      profile_pic,
      resume,
      role
    } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      !college_name ||
      !year ||
      !branch ||
      !course ||
      !rollno ||
      !contact ||
      !skills ||
      !profile_pic ||
      !resume
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      college_name,
      year,
      branch,
      course,
      rollno,
      contact,
      skills,
      profile_pic,
      resume,
      role: role || "user",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
  } catch (err) {
    console.error("Registration error:", err);
    next(createError(400, err.message || "Registration failed"));
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt for username:", username);

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password match:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("JWT token generated");

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      });
  } catch (err) {
    console.error("Login error:", err);
    // Return detailed error message for debugging
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    next(createError(500, "Logout failed"));
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    next(createError(500, "Failed to retrieve profile"));
  }
};
