import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import "./Events.scss";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const categories = [
    "Workshop", "Seminar", "Meetup", "Competition", "Cultural", "Sports", "Other"
  ];

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchTerm]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await newRequest.get(`/events?${params.toString()}`);
      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Workshop": return "🛠️";
      case "Seminar": return "🎓";
      case "Meetup": return "🤝";
      case "Competition": return "🏆";
      case "Cultural": return "🎭";
      case "Sports": return "⚽";
      default: return "📅";
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

  const getLocationDisplay = (location) => {
    if (location.type === "Virtual") {
      return "🌐 Virtual Event";
    } else if (location.type === "Hybrid") {
      return "🔄 Hybrid Event";
    } else {
      return `📍 ${location.address || "Physical Location"}`;
    }
  };

  return (
    <div className="events-container" data-theme={isDark ? 'dark' : 'light'}>
      <div className="animated-bg"></div>
      <div className="events">
        <div className="events-header glass-card">
          <div className="header-left">
            <h1 className="neon-text">🎉 Events</h1>
            <p>Discover and join exciting events in your college</p>
          </div>
        </div>

        <div className="filters glass-card">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
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
          </div>
        </div>

        <div className="events-content">
          {loading ? (
            <div className="loading glass-card">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event._id} className="event-card glass-card">
                  <div className="event-header">
                    <div className="event-meta">
                      <span className="category-icon">
                        {getCategoryIcon(event.category)}
                      </span>
                      <span className="category-badge">{event.category}</span>
                    </div>
                    <div className="event-date">
                      {formatDate(event.startDate)}
                    </div>
                  </div>

                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-location">
                      {getLocationDisplay(event.location)}
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="event-footer">
                    <div className="event-organizer">
                      <span>By {event.organizer?.username}</span>
                    </div>
                    
                    <div className="event-stats">
                      <span>👥 {event.attendees?.length || 0} attending</span>
                      {event.maxAttendees && (
                        <span>/ {event.maxAttendees} max</span>
                      )}
                    </div>
                  </div>

                  <div className="event-actions">
                    <button 
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="btn btn-primary"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="empty-state glass-card">
                  <h3>No Events Found</h3>
                  <p>There are no events matching your current filters.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory("all");
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

export default Events;