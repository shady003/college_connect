import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalResources: 0,
    totalAnnouncements: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(null);
  const [createForm, setCreateForm] = useState({});
  const navigate = useNavigate();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent": return "#dc3545";
      case "High": return "#fd7e14";
      case "Medium": return "#ffc107";
      case "Low": return "#28a745";
      default: return "#6c757d";
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchAllUsers();
    } else if (activeTab === "groups") {
      fetchAllGroups();
    } else if (activeTab === "resources") {
      fetchAllResources();
    } else if (activeTab === "events") {
      fetchAllEvents();
    } else if (activeTab === "announcements") {
      fetchAllAnnouncements();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching admin dashboard data...");
      const adminToken = localStorage.getItem("adminToken");
      console.log("Admin token:", adminToken ? "exists" : "missing");
      
      const [statsRes, usersRes, groupsRes] = await Promise.all([
        newRequest.get("/admin/stats"),
        newRequest.get("/admin/users/recent"),
        newRequest.get("/admin/groups/recent"),
      ]);

      setStats(statsRes.data);
      setRecentUsers(usersRes.data.users || []);
      setRecentGroups(groupsRes.data.groups || []);
      console.log("Dashboard data loaded successfully");
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      console.error("Error response:", err.response);
      if (err.response?.status === 401) {
        console.log("Unauthorized - redirecting to admin login");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log("Fetching all users...");
      const response = await newRequest.get("/admin/users");
      console.log("Users response:", response.data);
      setAllUsers(response.data.users || []);
      console.log("Fetched users count:", response.data.users?.length || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      console.error("Error details:", err.response?.data);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    }
  };

  const fetchAllGroups = async () => {
    try {
      const response = await newRequest.get("/admin/groups");
      setAllGroups(response.data.groups || []);
      console.log("Fetched groups:", response.data.groups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const fetchAllResources = async () => {
    try {
      const response = await newRequest.get("/admin/resources");
      setAllResources(response.data.resources || []);
      console.log("Fetched resources:", response.data.resources);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  const fetchAllAnnouncements = async () => {
    try {
      const response = await newRequest.get("/admin/announcements");
      setAllAnnouncements(response.data.announcements || []);
      console.log("Fetched announcements:", response.data.announcements);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const response = await newRequest.get("/admin/events");
      setAllEvents(response.data.events || []);
      console.log("Fetched events:", response.data.events);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    navigate("/admin/login");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await newRequest.delete(`/admin/users/${userId}`);
        fetchDashboardData();
        if (activeTab === "users") fetchAllUsers();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await newRequest.delete(`/admin/groups/${groupId}`);
        fetchDashboardData();
        if (activeTab === "groups") fetchAllGroups();
      } catch (err) {
        alert("Failed to delete group");
      }
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await newRequest.delete(`/admin/resources/${resourceId}`);
        fetchDashboardData();
        if (activeTab === "resources") fetchAllResources();
      } catch (err) {
        alert("Failed to delete resource");
      }
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await newRequest.delete(`/admin/announcements/${announcementId}`);
        fetchDashboardData();
        if (activeTab === "announcements") fetchAllAnnouncements();
      } catch (err) {
        alert("Failed to delete announcement");
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await newRequest.delete(`/admin/events/${eventId}`);
        fetchDashboardData();
        if (activeTab === "events") fetchAllEvents();
      } catch (err) {
        alert("Failed to delete event");
      }
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    try {
      const { type, _id } = editingItem;
      await newRequest.put(`/admin/${type}s/${_id}`, editForm);
      
      fetchDashboardData();
      if (type === "user") fetchAllUsers();
      else if (type === "group") fetchAllGroups();
      else if (type === "resource") fetchAllResources();
      else if (type === "event") fetchAllEvents();
      else if (type === "announcement") fetchAllAnnouncements();
      
      setEditingItem(null);
      setEditForm({});
      alert(`${type} updated successfully`);
    } catch (err) {
      alert(`Failed to update ${editingItem.type}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreate = (type) => {
    setShowCreateModal(type);
    setCreateForm({});
  };

  const handleCreateSubmit = async () => {
    try {
      await newRequest.post(`/admin/${showCreateModal}s`, createForm);
      fetchDashboardData();
      if (showCreateModal === "event") fetchAllEvents();
      else if (showCreateModal === "announcement") fetchAllAnnouncements();
      setShowCreateModal(null);
      setCreateForm({});
      alert(`${showCreateModal} created successfully`);
    } catch (err) {
      alert(`Failed to create ${showCreateModal}`);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateModal(null);
    setCreateForm({});
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="animated-bg"></div>
        <div className="loading glass-card">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="animated-bg"></div>
      <div className="admin-dashboard">
        {/* Header */}
        <header className="dashboard-header glass-card">
          <div className="header-left">
            <h1 className="neon-text">🛡️ Admin Dashboard</h1>
            <p>CollegeConnect Administration Panel</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="dashboard-nav glass-card">
          {["overview", "users", "groups", "resources", "events", "announcements"].map((tab) => (
            <button
              key={tab}
              className={`nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="dashboard-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card glass-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-info">
                    <h3>Total Groups</h3>
                    <p className="stat-number">{stats.totalGroups}</p>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <h3>Resources</h3>
                    <p className="stat-number">{stats.totalResources}</p>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon">📢</div>
                  <div className="stat-info">
                    <h3>Announcements</h3>
                    <p className="stat-number">{stats.totalAnnouncements}</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <div className="recent-section glass-card">
                  <h3>Recent Users</h3>
                  <div className="recent-list">
                    {recentUsers.map((user) => (
                      <div key={user._id} className="recent-item">
                        <div className="item-info">
                          <h4>{user.username}</h4>
                          <p>{user.email}</p>
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recent-section glass-card">
                  <h3>Recent Groups</h3>
                  <div className="recent-list">
                    {recentGroups.map((group) => (
                      <div key={group._id} className="recent-item">
                        <div className="item-info">
                          <h4>{group.name}</h4>
                          <p>{group.category}</p>
                          <span>{group.members?.length || 0} members</span>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-tab glass-card">
              <h2>User Management</h2>
              <p>Manage all registered users ({allUsers.length} total)</p>
              <div className="users-list">
                {allUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>No users found</p>
                  </div>
                ) : (
                  allUsers.map((user) => (
                    <div key={user._id} className="user-item glass-inner">
                      <div className="user-info">
                        <img 
                          src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`} 
                          alt={user.username}
                          className="user-avatar"
                        />
                        <div className="user-details">
                          <h4>{user.username}</h4>
                          <p>{user.email}</p>
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="groups-tab glass-card">
              <h2>Group Management</h2>
              <p>Manage all groups and communities ({allGroups.length} total)</p>
              <div className="groups-list">
                {allGroups.map((group) => (
                  <div key={group._id} className="group-item glass-inner">
                    <div className="group-info">
                      <h4>{group.name}</h4>
                      <p>{group.description}</p>
                      <div className="group-meta">
                        <span className="category">{group.category}</span>
                        <span className="privacy">{group.isPrivate ? "Private" : "Public"}</span>
                        <span className="members">{group.members?.length || 0} members</span>
                      </div>
                      <span className="created">Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="group-actions">
                      <button
                        onClick={() => navigate(`/group/${group._id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Group
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="resources-tab glass-card">
              <h2>Resource Management</h2>
              <p>Manage shared resources and files ({allResources.length} total)</p>
              <div className="resources-list">
                {allResources.map((resource) => (
                  <div key={resource._id} className="resource-item glass-inner">
                    <div className="resource-info">
                      <h4>{resource.title}</h4>
                      <p>{resource.description || "No description"}</p>
                      <div className="resource-meta">
                        <span className="type">{resource.type || "File"}</span>
                        <span className="category">{resource.category || "General"}</span>
                        <span className="downloads">{resource.downloadCount || 0} downloads</span>
                      </div>
                      <span className="creator">By: {resource.creator?.username || "Unknown"}</span>
                      <span className="created">Shared: {new Date(resource.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="resource-actions">
                      <button
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="btn btn-secondary btn-sm"
                      >
                        View File
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete Resource
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="events-tab glass-card">
              <div className="tab-header">
                <div>
                  <h2>Event Management</h2>
                  <p>Manage all events and activities ({allEvents.length} total)</p>
                </div>
                <button onClick={() => handleCreate("event")} className="btn btn-primary">
                  Create Event
                </button>
              </div>
              <div className="events-list">
                {allEvents.length === 0 ? (
                  <div className="empty-state">
                    <p>No events found</p>
                  </div>
                ) : (
                  allEvents.map((event) => (
                    <div key={event._id} className="event-item glass-inner">
                      <div className="event-info">
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                        <div className="event-meta">
                          <span className="date">📅 {new Date(event.startDate).toLocaleDateString()}</span>
                          <span className="location">📍 {event.location?.address || 'No location'}</span>
                          <span className="category">{event.category}</span>
                        </div>
                        <span className="organizer">By: {event.organizer?.username || "Unknown"}</span>
                        <span className="created">Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="event-actions">
                        <button
                          onClick={() => handleEdit(event, "event")}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="announcements-tab glass-card">
              <div className="tab-header">
                <div>
                  <h2>Announcement Management</h2>
                  <p>Create and manage system announcements ({allAnnouncements.length} total)</p>
                </div>
                <button onClick={() => handleCreate("announcement")} className="btn btn-primary">
                  Create Announcement
                </button>
              </div>
              <div className="announcements-list">
                {allAnnouncements.map((announcement) => (
                  <div key={announcement._id} className="announcement-item glass-inner">
                    <div className="announcement-info">
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>
                      <div className="announcement-meta">
                        <span className="category">{announcement.category}</span>
                        <span className="priority" style={{backgroundColor: getPriorityColor(announcement.priority)}}>
                          {announcement.priority}
                        </span>
                        <span className="reads">
                          👁️ {announcement.readBy?.length || 0} reads
                        </span>
                      </div>
                      {announcement.readBy && announcement.readBy.length > 0 && (
                        <div className="read-by-users">
                          <small>Read by: {announcement.readBy.map(userId => 
                            allUsers.find(u => u._id === userId)?.username || 'Unknown'
                          ).join(', ')}</small>
                        </div>
                      )}
                      <span className="author">By: {announcement.author?.username || "System"}</span>
                      <span className="created">Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="announcement-actions">
                      <button
                        onClick={() => navigate(`/announcement/${announcement._id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="edit-modal">
            <div className="modal-content glass-card">
              <h3>Create {showCreateModal}</h3>
              <div className="edit-form">
                {showCreateModal === "event" && (
                  <>
                    <input
                      type="text"
                      placeholder="Event Title"
                      value={createForm.title || ""}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      className="glass-input"
                    />
                    <textarea
                      placeholder="Event Description"
                      value={createForm.description || ""}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="glass-input"
                    />
                    <input
                      type="datetime-local"
                      placeholder="Event Date"
                      value={createForm.date || ""}
                      onChange={(e) => setCreateForm({...createForm, date: e.target.value})}
                      className="glass-input"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={createForm.location || ""}
                      onChange={(e) => setCreateForm({...createForm, location: e.target.value})}
                      className="glass-input"
                    />
                    <select
                      value={createForm.category || ""}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                      className="glass-input"
                    >
                      <option value="">Select Category</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Competition">Competition</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                  </>
                )}
                {showCreateModal === "announcement" && (
                  <>
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={createForm.title || ""}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      className="glass-input"
                    />
                    <textarea
                      placeholder="Announcement Content"
                      value={createForm.content || ""}
                      onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                      className="glass-input"
                    />
                    <select
                      value={createForm.category || ""}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                      className="glass-input"
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    <select
                      value={createForm.priority || ""}
                      onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                      className="glass-input"
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </>
                )}
              </div>
              <div className="modal-actions">
                <button onClick={handleCreateSubmit} className="btn btn-primary">Create</button>
                <button onClick={handleCreateCancel} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="edit-modal">
            <div className="modal-content glass-card">
              <h3>Edit {editingItem.type}</h3>
              <div className="edit-form">
                {editingItem.type === "user" && (
                  <>
                    <input
                      type="text"
                      placeholder="Username"
                      value={editForm.username || ""}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="glass-input"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="glass-input"
                    />
                  </>
                )}
                {editingItem.type === "group" && (
                  <>
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="glass-input"
                    />
                    <textarea
                      placeholder="Description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="glass-input"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="glass-input"
                    />
                  </>
                )}
                {editingItem.type === "resource" && (
                  <>
                    <input
                      type="text"
                      placeholder="Title"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="glass-input"
                    />
                    <textarea
                      placeholder="Description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="glass-input"
                    />
                    <input
                      type="url"
                      placeholder="File URL"
                      value={editForm.fileUrl || ""}
                      onChange={(e) => setEditForm({...editForm, fileUrl: e.target.value})}
                      className="glass-input"
                    />
                  </>
                )}
              </div>
              <div className="modal-actions">
                <button onClick={handleSaveEdit} className="btn btn-primary">Save</button>
                <button onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;