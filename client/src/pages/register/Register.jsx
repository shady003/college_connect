import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import upload from "../../utils/uplaod.js";
import { newRequest } from "../../utils/newRequest.js";
import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    college_name: "",
    year: "",
    branch: "",
    course: "",
    rollno: "",
    contact: "",
    skills: "",
    profile_pic: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress("Starting registration...");

    try {
      // Upload files in parallel
      setProgress("Uploading files...");
      const uploadPromises = [];
      
      if (profilePic) {
        uploadPromises.push(upload(profilePic, "image"));
      } else {
        uploadPromises.push(Promise.resolve(null));
      }
      
      if (resumeFile) {
        uploadPromises.push(upload(resumeFile, "raw"));
      } else {
        uploadPromises.push(Promise.resolve(null));
      }

      const [profilePicUrl, resumeUrl] = await Promise.all(uploadPromises);
      setProgress("Files uploaded successfully. Creating account...");
      
      const payload = {
        ...formData,
        contact: Number(formData.contact), // Convert to number
        profile_pic: profilePicUrl,
        resume: resumeUrl,
        skills: formData.skills.split(",").map((s) => s.trim()),
      };

      setProgress("Creating account...");
      await register(payload);
      setProgress("Registration successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.error("Registration Error:", err);
      setLoading(false);
      setProgress("");
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="register-bg-wrapper">
      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Join CollegeConnect</h1>
            <p>Create your account and start connecting</p>
          </div>

          {progress && (
            <div className="progress-indicator">
              <p>{progress}</p>
              {loading && <div className="loading-spinner"></div>}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    required
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>College Name</label>
                <input
                  name="college_name"
                  type="text"
                  placeholder="Enter college name"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Year</label>
                <select name="year" required onChange={handleChange} disabled={loading}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="input-group">
                <label>Branch</label>
                <input
                  name="branch"
                  type="text"
                  placeholder="Enter branch"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Course</label>
                <input
                  name="course"
                  type="text"
                  placeholder="Enter course"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Roll Number</label>
                <input
                  name="rollno"
                  type="text"
                  placeholder="Enter roll number"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Contact Number</label>
                <input
                  name="contact"
                  type="tel"
                  placeholder="Enter contact number"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group full-width">
                <label>Skills</label>
                <input
                  name="skills"
                  type="text"
                  placeholder="Enter skills (comma separated)"
                  required
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Resume (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="form-footer">
            <p className="login-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
