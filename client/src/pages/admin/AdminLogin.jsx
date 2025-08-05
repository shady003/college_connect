import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./AdminLogin.scss";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      console.log("Attempting admin login...");
      const response = await newRequest.post("/admin/login", formData);
      console.log("Login response:", response.data);
      
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminId", response.data.admin._id);
      
      console.log("Tokens stored, navigating to dashboard...");
      // Force page redirect to ensure proper route protection
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="animated-bg"></div>
      <div className="admin-login">
        <div className="login-card glass-card">
          <div className="login-header">
            <h1 className="neon-text">🔐 Admin Login</h1>
            <p>Access the CollegeConnect Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input"
                placeholder="Enter admin email"
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

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have admin access?{" "}
              <Link to="/admin/register" className="link">
                Register here
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

export default AdminLogin;