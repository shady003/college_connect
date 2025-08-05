import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useScrollAnimation } from "../../hooks/useScrollAnimation.js";
import usePageMeta from "../../hooks/usePageMeta.js";
import { newRequest } from "../../utils/newRequest.js";
import Chatbot from "../../components/chatbot/Chatbot.jsx";
import LazyThreeBackground from "../../components/LazyThreeBackground.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import Dashboard3D from "../../components/Dashboard3D.jsx";
import Books from "../books/Books.jsx";
import "./Dashboard.scss";

const Dashboard = () => {
  usePageMeta("Dashboard", "🏠");
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [is3D, setIs3D] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  let isDark = true;
  try {
    const themeContext = useTheme();
    isDark = themeContext.isDark;
  } catch (error) {
    console.warn('Theme context not available, using default dark theme');
  }
  
  // Scroll animation refs
  const headerRef = useScrollAnimation();
  const welcomeRef = useScrollAnimation();
  const statsRef = useScrollAnimation();
  const actionsRef = useScrollAnimation();
  const activityRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {

        setLoading(false);
        return;
      }

      try {
        // Fetch groups with better error handling
        try {
          const groupsRes = await newRequest.get("/groups/user/joined");
          const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : [];
          setGroups(groupsData);
        } catch (err) {
          console.error("Groups fetch error:", err.response?.data || err.message);
          // Try fallback to public groups
          try {
            const publicGroupsRes = await newRequest.get("/groups/public");
            const publicGroups = publicGroupsRes.data?.groups || [];
            setGroups(publicGroups.slice(0, 3)); // Show first 3 as user groups
          } catch (fallbackErr) {
            console.error("Public groups fallback failed:", fallbackErr);
            setGroups([]);
          }
        }

        // Fetch all groups
        try {
          const allGroupsRes = await newRequest.get("/groups");
          const allGroupsData = allGroupsRes.data?.groups || allGroupsRes.data || [];
          setAllGroups(Array.isArray(allGroupsData) ? allGroupsData : []);
        } catch (err) {
          console.error("All groups fetch error:", err.response?.data || err.message);
          // Try public groups as fallback
          try {
            const publicGroupsRes = await newRequest.get("/groups/public");
            const publicGroups = publicGroupsRes.data?.groups || [];
            setAllGroups(publicGroups);
          } catch (fallbackErr) {
            console.error("Public groups fallback failed:", fallbackErr);
            setAllGroups([]);
          }
        }

        // Fetch events
        try {
          const eventsRes = await newRequest.get("/events");
          const eventsData = eventsRes.data?.events || eventsRes.data || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (err) {
          console.error("Events fetch error:", err.response?.data || err.message);
          setEvents([]);
        }

        // Fetch resources
        try {
          const resourcesRes = await newRequest.get("/resources");
          const resourcesData = resourcesRes.data?.resources || resourcesRes.data || [];
          setResources(Array.isArray(resourcesData) ? resourcesData : []);
        } catch (err) {
          console.error("Resources fetch error:", err.response?.data || err.message);
          setResources([]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleViewEvent = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleViewResource = (resourceId) => {
    navigate(`/resource/${resourceId}`);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await newRequest.post(`/groups/${groupId}/join`);
      alert(response.data.message || "Successfully joined group!");
      // Refresh data
      const [groupsRes, allGroupsRes] = await Promise.all([
        newRequest.get("/groups/user/joined"),
        newRequest.get("/groups"),
      ]);
      setGroups(groupsRes.data || []);
      setAllGroups(allGroupsRes.data.groups || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  const handleDownloadResource = async (resourceId) => {
    try {
      const response = await newRequest.post(`/resources/${resourceId}/download`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert("Failed to download resource");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }



  if (!user) {
    return (
      <div className="error-message" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2>Authentication Required</h2>
        <p>Please log in to access your dashboard.</p>
        <button 
          onClick={() => navigate("/login")}
          style={{
            background: '#00ffe7',
            color: '#1a1a1a',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '1rem'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`dashboard-bg-wrapper ${isDark ? 'dark' : 'light'}`}>
      <LazyThreeBackground />
      <div className="dashboard">
        {/* Header */}
        <header ref={headerRef} className="dashboard-header scroll-animate">
          <div className="header-left">
            <h1>Welcome back, {user?.username || 'User'}!</h1>
            <p>Your CollegeConnect Dashboard</p>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setIs3D(!is3D)}
              style={{
                background: is3D ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.1)',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: is3D ? 'var(--bg-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                marginRight: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {is3D ? '2D View' : '3D View'}
            </button>
            <ThemeToggle />
          </div>
        </header>



        {/* 3D Dashboard */}
        {is3D ? (
          <Dashboard3D 
            groups={groups}
            events={events}
            resources={resources}
            user={user}
            onCardClick={(type) => {
              setIs3D(false);
              if (type === 'groups') setActiveTab('groups');
              else if (type === 'events') setActiveTab('events');
              else if (type === 'resources') setActiveTab('resources');
              else if (type === 'profile') navigate('/profile');
            }}
          />
        ) : (
          <>
            {/* Tabs Navigation */}
            <nav className="dashboard-nav">
              {["overview", "groups", "all-groups", "events", "resources", "books"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? "active" : ""}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab === "all-groups" ? "All Groups" : 
                     tab === "books" ? "📚 Books" :
                     tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </nav>

            {/* Tab Content */}
            <main className="dashboard-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              {/* Welcome Section */}
              <div className="welcome-section">
                <h2>Dashboard Overview</h2>
                <p>Welcome to your CollegeConnect hub! Here's everything you need to stay connected with your academic community.</p>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3>My Groups</h3>
                  <p className="stat-number">{groups?.length || 0}</p>
                  <p className="stat-description">Active group memberships</p>
                  <button onClick={() => handleTabChange("groups")}>
                    View All Groups
                  </button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <h3>Upcoming Events</h3>
                  <p className="stat-number">{events?.length || 0}</p>
                  <p className="stat-description">Events to attend</p>
                  <button onClick={() => handleTabChange("events")}>
                    View All Events
                  </button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <h3>Shared Resources</h3>
                  <p className="stat-number">{resources?.length || 0}</p>
                  <p className="stat-description">Available resources</p>
                  <button onClick={() => handleTabChange("resources")}>
                    View All Resources
                  </button>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <h3>My Skills</h3>
                  <p className="stat-number">{user?.skills?.length || 0}</p>
                  <p className="stat-description">Skills in profile</p>
                  <button onClick={() => navigate("/profile")}>
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>🚀 Quick Actions</h2>
                <p>Get started with these common tasks</p>
                <div className="action-buttons">
                  <button onClick={() => navigate("/create-group")}>
                    <span className="action-icon">➕</span>
                    Create Group
                  </button>
                  <button onClick={() => navigate("/share-resource")}>
                    <span className="action-icon">📤</span>
                    Share Resource
                  </button>
                  <button onClick={() => navigate("/explore")}>
                    <span className="action-icon">🔍</span>
                    Explore
                  </button>
                  <button onClick={() => navigate("/create-event")}>
                    <span className="action-icon">🎉</span>
                    Create Event
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h2>📈 Recent Activity</h2>
                <p>Your latest interactions and updates</p>
                <div className="activity-list">
                  {groups && groups.length > 0 ? (
                    groups.slice(0, 3).map((group, index) => (
                      <div key={group._id || Math.random()} className="activity-item">
                        <div className="activity-icon">👥</div>
                        <div className="activity-content">
                          <p>
                            Joined <strong>{group.name || 'Unknown Group'}</strong>
                          </p>
                          <span className="activity-time">
                            {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <div className="activity-badge">New</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">
                      <div className="empty-icon">🌟</div>
                      <h3>Ready to Get Started?</h3>
                      <p>No recent activity. Start by joining a group and connecting with your peers!</p>
                      <button 
                        onClick={() => navigate("/explore")}
                        className="explore-btn"
                      >
                        🚀 Explore Groups
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Features */}
              <div className="features-section">
                <h2>🎯 Platform Features</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h3>Group Chat</h3>
                    <p>Real-time messaging with your group members</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📋</div>
                    <h3>Resource Sharing</h3>
                    <p>Share and access study materials and resources</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎪</div>
                    <h3>Event Management</h3>
                    <p>Create and join academic and social events</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🤖</div>
                    <h3>AI Assistant</h3>
                    <p>Get help with questions using our chatbot</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="groups-tab">
              <div className="tab-header">
                <h2>My Groups</h2>
                <button
                  onClick={() => navigate("/create-group")}
                  className="create-btn"
                >
                  Create New Group
                </button>
              </div>
              <div className="groups-grid">
                {groups.map((group, index) => (
                  <div key={group._id} className="group-card" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="group-header">
                      <h3>{group.name}</h3>
                      <span className="group-category">{group.category}</span>
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-stats">
                      <span>{group.members?.length || 0} members</span>
                      <span>{group.isPrivate ? "Private" : "Public"}</span>
                    </div>
                    <div className="group-actions">
                      <button onClick={() => handleViewGroup(group._id)}>
                        View Group
                      </button>
                      <button 
                        onClick={() => navigate(`/group/${group._id}/chat`)}
                        className="chat-btn"
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="empty-state">
                    <h3>No Groups Yet</h3>
                    <p>Join or create your first group to start connecting!</p>
                    <button onClick={() => navigate("/explore")}>
                      Explore Groups
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "all-groups" && (
            <div className="all-groups-tab">
              <div className="tab-header">
                <h2>All Groups</h2>
                <button
                  onClick={() => navigate("/create-group")}
                  className="create-btn"
                >
                  Create New Group
                </button>
              </div>
              <div className="groups-grid">
                {allGroups.map((group) => {
                  const isMember = group.userStatus?.isMember;
                  return (
                    <div key={group._id} className="group-card">
                      <div className="group-header">
                        <h3>{group.name}</h3>
                        <span className="group-category">{group.category}</span>
                      </div>
                      <p className="group-description">{group.description}</p>
                      <div className="group-stats">
                        <span>{group.members?.length || 0} members</span>
                        <span>{group.isPrivate ? "🔒 Private" : "🌐 Public"}</span>
                      </div>
                      <div className="group-actions">
                        <button onClick={() => handleViewGroup(group._id)}>
                          View Group
                        </button>
                        {isMember ? (
                          <button 
                            onClick={() => navigate(`/group/${group._id}/chat`)}
                            className="chat-btn"
                          >
                            💬 Chat
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinGroup(group._id)}
                            className="join-btn"
                          >
                            Join Group
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {allGroups.length === 0 && (
                  <div className="empty-state">
                    <h3>No Groups Available</h3>
                    <p>Be the first to create a group!</p>
                    <button onClick={() => navigate("/create-group")}>
                      Create Group
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="events-tab">
              <div className="tab-header">
                <h2>Upcoming Events</h2>
                <button
                  onClick={() => navigate("/create-event")}
                  className="create-btn"
                >
                  Create Event
                </button>
              </div>
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-category">{event.category}</span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
                      <span>📅 {new Date(event.date || event.startDate).toLocaleDateString()}</span>
                      <span>📍 {typeof event.location === 'object' ? event.location?.address || event.location?.type || 'TBD' : event.location || 'TBD'}</span>
                    </div>
                    <button onClick={() => handleViewEvent(event._id)}>
                      View Event
                    </button>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="empty-state">
                    <h3>No Events Yet</h3>
                    <p>Create or join events to stay connected!</p>
                    <button onClick={() => navigate("/create-event")}>
                      Create Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="resources-tab">
              <div className="tab-header">
                <h2>Shared Resources</h2>
                <button
                  onClick={() => navigate("/share-resource")}
                  className="create-btn"
                >
                  Share Resource
                </button>
              </div>
              <div className="resources-grid">
                {resources.map((resource) => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-header">
                      <h3>{resource.title}</h3>
                      <span className="resource-type">{resource.type}</span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                    <div className="resource-stats">
                      <span>👤 {resource.sharedBy?.username}</span>
                      <span>📁 {resource.category}</span>
                    </div>
                    <div className="resource-actions">
                      <button onClick={() => handleViewResource(resource._id)}>
                        View
                      </button>
                      <button 
                        onClick={() => handleDownloadResource(resource._id)}
                        className="download-btn"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                ))}
                {resources.length === 0 && (
                  <div className="empty-state">
                    <h3>No Resources Yet</h3>
                    <p>Share your first resource to help others!</p>
                    <button onClick={() => navigate("/share-resource")}>
                      Share Resource
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "books" && (
            <Books />
          )}
            </main>
            <Chatbot />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;