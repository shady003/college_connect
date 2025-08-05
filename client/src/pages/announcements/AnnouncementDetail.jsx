import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { newRequest } from "../../utils/newRequest.js";
import "./Announcements.scss";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRead, setIsRead] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    fetchAnnouncementDetail();
  }, [id]);

  const fetchAnnouncementDetail = async () => {
    try {
      const response = await newRequest.get(`/announcements/${id}`);
      const data = response.data.announcement || response.data;
      setAnnouncement(data);
      setIsRead(data.readBy?.includes(user?._id));
    } catch (err) {
      console.error("Failed to fetch announcement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (isRead || markingAsRead) return;
    
    setMarkingAsRead(true);
    try {
      await newRequest.post(`/announcements/${id}/read`);
      setIsRead(true);
      setAnnouncement(prev => ({
        ...prev,
        readBy: [...(prev.readBy || []), user._id]
      }));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setMarkingAsRead(false);
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

  if (loading) {
    return (
      <div className="announcements-container">
        <div className="loading glass-card">
          <div className="loading-spinner"></div>
          <p>Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="announcements-container">
        <div className="empty-state glass-card">
          <h3>Announcement Not Found</h3>
          <p>The announcement you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/announcements")} className="btn btn-primary">
            Back to Announcements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      <div className="announcement-detail">
        <div className="detail-header glass-card">
          <button onClick={() => navigate("/announcements")} className="back-btn">
            ← Back to Announcements
          </button>
          
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
        </div>

        <div className="detail-content glass-card">
          <h1 className="announcement-title">{announcement.title}</h1>
          
          <div className="announcement-info">
            <div className="author-info">
              <span>By {announcement.author?.username}</span>
            </div>
            <div className="date-info">
              <span>{new Date(announcement.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>

          <div className="announcement-content">
            <p>{announcement.content}</p>
          </div>

          {announcement.tags && announcement.tags.length > 0 && (
            <div className="announcement-tags">
              {announcement.tags.map((tag, index) => (
                <span key={index} className="tag-badge">{tag}</span>
              ))}
            </div>
          )}

          <div className="announcement-stats">
            <span>👁️ {announcement.readBy?.length || 0} people have read this</span>
            {announcement.allowComments && (
              <span>💬 {announcement.comments?.length || 0} comments</span>
            )}
          </div>

          <div className="announcement-actions">
            <button 
              onClick={handleMarkAsRead}
              disabled={markingAsRead || isRead}
              className={`btn btn-primary mark-read-btn ${isRead ? 'read' : ''}`}
            >
              {markingAsRead ? "Marking..." : isRead ? "✅ Read" : "✓ Mark as Read"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;