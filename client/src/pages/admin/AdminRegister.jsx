import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./AdminRegister.scss";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await newRequest.post("/admin/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        adminKey: formData.adminKey,
      });
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="animated-bg"></div>
      <div className="admin-register">
        <div className="register-card glass-card">
          <div className="register-header">
            <h1 className="neon-text">👑 Admin Registration</h1>
            <p>Create your CollegeConnect Admin Account</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="glass-input"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input"
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="glass-input"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input"
                placeholder="Confirm password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminKey">Admin Key</label>
              <input
                type="password"
                id="adminKey"
                name="adminKey"
                value={formData.adminKey}
                onChange={handleChange}
                className="glass-input"
                placeholder="Enter admin key"
                required
              />
              <small>Contact system administrator for admin key</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary register-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have admin access?{" "}
              <Link to="/admin/login" className="link">
                Sign in here
              </Link>
            </p>
            <Link to="/login" className="link">
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;