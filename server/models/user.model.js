import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  college_name: { type: String, required: true },
  year: { type: Number, required: true },
  branch: { type: String, required: true },
  course: { type: String, required: true },
  rollno: { type: String, required: true },
  contact: { type: Number, required: true },
  skills: { type: [String], required: true },
  profile_pic: { type: String, required: true },
  resume: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export default mongoose.model("User", userSchema);