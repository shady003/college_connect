import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import './Navbar.scss';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleToggle = () => setOpen(!open);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="navbar" data-theme={isDark ? 'dark' : 'light'}>
      <div className="navbar__logo">
        <Link to="/" className="logo-link">
          CollegeConnect
        </Link>
        {user && (
          <span className="user-indicator">
            Welcome, {user.username}
          </span>
        )}
      </div>

      <div className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
        <ThemeToggle />
        {user ? (
          <>
            {user.role === "admin" ? (
              <>
                <Link to="/admin/dashboard" className="navbar__link">Admin Dashboard</Link>
                <Link to="/notifications" className="navbar__link">Notifications</Link>
                <div className="navbar__user">
                  <img 
                    src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`} 
                    alt="Profile" 
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`;
                    }}
                  />
                  <div className="user-menu">
                    <Link to="/profile" className="menu-item">Profile</Link>
                    <button onClick={handleLogout} className="menu-item logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="navbar__link">Dashboard</Link>
                <Link to="/explore" className="navbar__link">Explore</Link>
                <Link to="/announcements" className="navbar__link">Announcements</Link>
                <div className="navbar__user">
                  <img 
                    src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`} 
                    alt="Profile" 
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`;
                    }}
                  />
                  <div className="user-menu">
                    <Link to="/profile" className="menu-item">Profile</Link>
                    <button onClick={handleLogout} className="menu-item logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">Login</Link>
            <Link to="/register" className="navbar__link">Register</Link>
            <Link to="/admin/login" className="navbar__link">Admin Login</Link>
            <Link to="/admin/register" className="navbar__link">Admin Register</Link>
          </>
        )}
      </div>

      <div className={`navbar__toggle ${open ? 'open' : ''}`} onClick={handleToggle}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </nav>
  );
};

export default Navbar;
