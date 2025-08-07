import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

import "./Login.scss";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setProgress("Logging in...");

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      setProgress("Login successful! Redirecting...");

      // Wait a moment to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setProgress("");

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      username: "testuser10",
      password: "password123",
    });

    // Automatically submit after setting demo credentials
    setTimeout(() => {
      handleSubmit(new Event("submit"));
    }, 100);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg-wrapper" data-theme={isDark ? 'dark' : 'light'}>

      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      <div className="login-container">
        <div className="login-card">
        <div className="login-header">
          <h1>Welcome to CollegeConnect</h1>
          <p>Connect with your college community</p>
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

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={loading}
                required
              />
              
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
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

          <div className="form-actions">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>

            <button
              type="button"
              className="demo-button"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Try Demo Login
            </button>
          </div>

          <div className="form-footer">
            <p className="signup-text">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
            <p className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </div>
        </form>

        <div className="login-features">
          <h3>Why CollegeConnect?</h3>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">👥</span>
              <h4>Join Groups</h4>
              <p>
                Connect with students in your course, branch, or interests
              </p>
            </div>
            <div className="feature">
              <span className="feature-icon">📚</span>
              <h4>Share Resources</h4>
              <p>Upload and access study materials, notes, and assignments</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎉</span>
              <h4>Attend Events</h4>
              <p>Participate in workshops, seminars, and college events</p>
            </div>
            <div className="feature">
              <span className="feature-icon">❓</span>
              <h4>Ask Questions</h4>
              <p>Get help from seniors and peers through mentorship</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
