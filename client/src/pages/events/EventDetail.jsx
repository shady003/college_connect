import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./EventDetail.scss";

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      console.log('Fetching event:', id);
      const response = await newRequest.get(`/events/${id}`);
      console.log('Event response:', response.data);
      setEvent(response.data.event);
      
      // Check if user is already attending
      const isAttending = response.data.event.attendees.some(
        attendee => attendee.user._id === user.id
      );
      console.log('User attending status:', isAttending);
      setAttending(isAttending);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendEvent = async () => {
    try {
      console.log('Attempting to attend event:', id);
      const response = await newRequest.post(`/events/${id}/attend`);
      console.log('Attend event response:', response.data);
      setAttending(true);
      fetchEvent(); // Refresh event data
    } catch (err) {
      console.error("Failed to attend event:", err);
      console.error("Error details:", err.response?.data);
      alert(`Failed to attend event: ${err.response?.data?.message || err.message}`);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationDisplay = (location) => {
    if (location.type === "Virtual") {
      return {
        icon: "🌐",
        text: "Virtual Event",
        link: location.virtualLink
      };
    } else if (location.type === "Hybrid") {
      return {
        icon: "🔄",
        text: "Hybrid Event",
        address: location.address,
        link: location.virtualLink
      };
    } else {
      return {
        icon: "📍",
        text: location.address || "Physical Location"
      };
    }
  };

  if (loading) {
    return (
      <div className="event-detail-container" data-theme={isDark ? 'dark' : 'light'}>
        <div className="loading glass-card">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-container" data-theme={isDark ? 'dark' : 'light'}>
        <div className="error glass-card">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const locationInfo = getLocationDisplay(event.location);

  return (
    <div className="event-detail-container" data-theme={isDark ? 'dark' : 'light'}>
      <div className="animated-bg"></div>
      <div className="event-detail">
        <button onClick={() => navigate('/events')} className="back-btn">
          ← Back to Events
        </button>

        <div className="event-header glass-card">
          <div className="event-meta">
            <span className="category-icon">
              {getCategoryIcon(event.category)}
            </span>
            <span className="category-badge">{event.category}</span>
          </div>
          <h1 className="event-title">{event.title}</h1>
          <p className="event-organizer">Organized by {event.organizer?.username}</p>
        </div>

        <div className="event-content">
          <div className="event-main glass-card">
            <div className="event-description">
              <h3>About This Event</h3>
              <p>{event.description}</p>
            </div>

            <div className="event-details">
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div>
                  <strong>Start Date</strong>
                  <p>{formatDate(event.startDate)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🏁</span>
                <div>
                  <strong>End Date</strong>
                  <p>{formatDate(event.endDate)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">{locationInfo.icon}</span>
                <div>
                  <strong>Location</strong>
                  <p>{locationInfo.text}</p>
                  {locationInfo.address && <p>{locationInfo.address}</p>}
                  {locationInfo.link && (
                    <a href={locationInfo.link} target="_blank" rel="noopener noreferrer">
                      Join Virtual Event
                    </a>
                  )}
                </div>
              </div>

              {event.maxAttendees && (
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <div>
                    <strong>Capacity</strong>
                    <p>{event.attendees.length} / {event.maxAttendees} attendees</p>
                  </div>
                </div>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="event-tags">
                <h4>Tags</h4>
                <div className="tags-list">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {event.requirements && event.requirements.length > 0 && (
              <div className="event-requirements">
                <h4>Requirements</h4>
                <ul>
                  {event.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="event-sidebar">
            <div className="attendance-card glass-card">
              <h3>Attendance</h3>
              <div className="attendance-stats">
                <span className="attendee-count">
                  {event.attendees.length} people attending
                </span>
              </div>
              
              {!attending ? (
                <button 
                  onClick={handleAttendEvent}
                  className="btn btn-primary attend-btn"
                  disabled={event.maxAttendees && event.attendees.length >= event.maxAttendees}
                >
                  {event.maxAttendees && event.attendees.length >= event.maxAttendees 
                    ? "Event Full" 
                    : "Attend Event"
                  }
                </button>
              ) : (
                <div className="attending-status">
                  <span className="status-icon">✅</span>
                  <span>You're attending this event</span>
                </div>
              )}
            </div>

            {event.attendees && event.attendees.length > 0 && (
              <div className="attendees-card glass-card">
                <h4>Attendees</h4>
                <div className="attendees-list">
                  {event.attendees.slice(0, 10).map((attendee, index) => (
                    <div key={index} className="attendee-item">
                      <div className="attendee-avatar">
                        {attendee.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="attendee-info">
                        <span className="attendee-name">{attendee.user.username}</span>
                        <span className="attendee-college">{attendee.user.college_name}</span>
                      </div>
                    </div>
                  ))}
                  {event.attendees.length > 10 && (
                    <div className="more-attendees">
                      +{event.attendees.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;