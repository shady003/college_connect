import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import "./Announcements.scss";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const categories = [
    "Exam", "Holiday", "Event", "General", "Academic", "Cultural", "Sports", "Other"
  ];

  const priorities = ["Low", "Medium", "High", "Urgent"];

  useEffect(() => {
    fetchAnnouncements();
    fetchUnreadCount();
  }, [selectedCategory, selectedPriority, searchTerm]);

  const fetchAnnouncements = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedPriority !== "all") params.append("priority", selectedPriority);
      if (searchTerm) params.append("search", searchTerm);

      const response = await newRequest.get(`/announcements?${params.toString()}`);
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await newRequest.get("/announcements/unread-count");
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent": return "#dc3545";
      case "High": return "#fd7e14";
      case "Medium": return "#ffc107";
      case "Low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Exam": return "📝";
      case "Holiday": return "🏖️";
      case "Event": return "🎉";
      case "Academic": return "📚";
      case "Cultural": return "🎭";
      case "Sports": return "⚽";
      case "General": return "📢";
      default: return "📋";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="announcements-container" data-theme={isDark ? 'dark' : 'light'}>
      <div className="animated-bg"></div>
      <div className="announcements">
        <div className="announcements-header glass-card">
          <div className="header-left">
            <h1 className="neon-text">📢 Announcements</h1>
            <p>Stay updated with important notices and updates</p>
          </div>
          <div className="header-right">
            <div className="unread-badge">
              <span className="badge">{unreadCount}</span>
              <span>Unread</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters glass-card">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="glass-select"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="announcements-content">
          {loading ? (
            <div className="loading glass-card">
              <div className="loading-spinner"></div>
              <p>Loading announcements...</p>
            </div>
          ) : (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="announcement-card glass-card">
                  <div className="announcement-header">
                    <div className="announcement-meta">
                      <span className="category-icon">
                        {getCategoryIcon(announcement.category)}
                      </span>
                      <span className="category-badge">{announcement.category}</span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                      >
                        {announcement.priority}
                      </span>
                    </div>
                    <div className="announcement-date">
                      {formatDate(announcement.createdAt)}
                    </div>
                  </div>

                  <div className="announcement-content">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <p className="announcement-text">{announcement.content}</p>
                  </div>

                  {announcement.tags && announcement.tags.length > 0 && (
                    <div className="announcement-tags">
                      {announcement.tags.map((tag, index) => (
                        <span key={index} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="announcement-footer">
                    <div className="announcement-author">
                      <span>By {announcement.author?.username}</span>
                    </div>
                    
                    <div className="announcement-stats">
                      <span>👁️ {announcement.readBy?.length || 0} read</span>
                      {announcement.allowComments && (
                        <span>💬 {announcement.comments?.length || 0} comments</span>
                      )}
                    </div>
                  </div>

                  <div className="announcement-actions">
                    <button 
                      onClick={() => navigate(`/announcement/${announcement._id}`)}
                      className="btn btn-primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="empty-state glass-card">
                  <h3>No Announcements Found</h3>
                  <p>There are no announcements matching your current filters.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedPriority("all");
                      setSearchTerm("");
                    }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements; 