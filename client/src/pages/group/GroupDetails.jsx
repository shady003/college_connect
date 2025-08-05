import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./GroupDetails.scss";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchJoinRequests();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const response = await newRequest.get(`/groups/${id}`);
      setGroup(response.data);
      
      // Determine user role
      const currentUserId = localStorage.getItem("userId");
      const member = response.data.members.find(m => m.user._id === currentUserId);
      setUserRole(member?.role || null);
      setIsCreator(response.data.creator._id === currentUserId);
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await newRequest.get(`/groups/${id}/join-requests`);
      setJoinRequests(response.data.joinRequests || []);
    } catch (err) {
      // Only log error if user has permission to view requests
      if (err.response?.status !== 403) {
        console.error("Failed to fetch join requests:", err);
      }
    }
  };

  const handleJoinGroup = async () => {
    try {
      await newRequest.post(`/groups/${id}/join`);
      fetchGroupDetails();
      alert("Join request sent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await newRequest.post(`/groups/${id}/leave`);
        navigate("/dashboard");
      } catch (err) {
        alert("Failed to leave group");
      }
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      await newRequest.post(`/groups/${id}/approve/${userId}`);
      fetchGroupDetails();
      fetchJoinRequests();
    } catch (err) {
      alert("Failed to approve request");
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await newRequest.post(`/groups/${id}/reject/${userId}`);
      fetchJoinRequests();
    } catch (err) {
      alert("Failed to reject request");
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await newRequest.delete(`/groups/${id}`);
        navigate("/dashboard");
      } catch (err) {
        alert("Failed to delete group");
      }
    }
  };

  if (loading) {
    return (
      <div className="group-details-container">
        <div className="animated-bg"></div>
        <div className="loading glass-card">
          <div className="loading-spinner"></div>
          <p>Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-details-container">
        <div className="animated-bg"></div>
        <div className="error glass-card">
          <h2>Group not found</h2>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const isMember = userRole !== null;
  const canManage = isCreator || userRole === "admin";

  return (
    <div className="group-details-container">
      <div className="animated-bg"></div>
      <div className="group-details">
        {/* Header */}
        <div className="group-header glass-card">
          <div className="group-info">
            <h1 className="neon-text">{group.name}</h1>
            <div className="group-meta">
              <span className="meta-badge category">{group.category}</span>
              <span className="meta-badge privacy">
                {group.isPrivate ? "🔒 Private" : "🌐 Public"}
              </span>
              <span className="meta-badge members">
                👥 {group.members.length}/{group.maxMembers} members
              </span>
            </div>
            <p className="description">{group.description}</p>
          </div>
          
          <div className="group-actions">
            {!isMember && (
              <button onClick={handleJoinGroup} className="btn btn-primary">
                {group.isPrivate ? "Request to Join" : "Join Group"}
              </button>
            )}
            {isMember && (
              <>
                <button onClick={() => navigate(`/group/${id}/chat`)} className="btn btn-secondary">
                  💬 Open Chat
                </button>
                <button onClick={handleLeaveGroup} className="btn btn-warning">
                  Leave Group
                </button>
              </>
            )}
            {isCreator && (
              <button onClick={handleDeleteGroup} className="btn btn-danger">
                Delete Group
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="group-nav glass-card">
          <button
            className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`nav-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members ({group.members.length})
          </button>
          {canManage && joinRequests.length > 0 && (
            <button
              className={`nav-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Join Requests ({joinRequests.length})
            </button>
          )}
          {canManage && (
            <button
              className={`nav-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          )}
        </nav>

        {/* Content */}
        <div className="group-content glass-card">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="info-section">
                <h3 className="section-title">About this Group</h3>
                <p className="group-description">{group.description}</p>
                
                {group.tags && group.tags.length > 0 && (
                  <div className="tags-section">
                    <h4 className="subsection-title">Tags:</h4>
                    <div className="tag-list">
                      {group.tags.map((tag, idx) => (
                        <span key={idx} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {group.rules && group.rules.length > 0 && (
                  <div className="rules-section">
                    <h4 className="subsection-title">Group Rules:</h4>
                    <ul className="rules-list">
                      {group.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="creator-info glass-inner">
                <h4 className="subsection-title">Created by:</h4>
                <p className="creator-name">{group.creator.username}</p>
                <p className="creation-date">Created on: {new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="members-tab">
              <h3 className="section-title">Group Members</h3>
              <div className="members-list">
                {group.members.map((member) => (
                  <div key={member.user._id} className="member-card glass-inner">
                    <div className="member-info">
                      <h4 className="member-name">{member.user.username}</h4>
                      <span className="role-badge">{member.role}</span>
                    </div>
                    <div className="member-meta">
                      <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "requests" && canManage && (
            <div className="requests-tab">
              <h3 className="section-title">Join Requests</h3>
              {joinRequests.length === 0 ? (
                <p className="no-requests">No pending join requests</p>
              ) : (
                <div className="requests-list">
                  {joinRequests.map((request) => (
                    <div key={request.user._id} className="request-card glass-inner">
                      <div className="request-info">
                        <h4 className="request-name">{request.user.username}</h4>
                        <p className="request-email">{request.user.email}</p>
                        <span className="request-date">Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleApproveRequest(request.user._id)}
                          className="btn btn-success btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.user._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && canManage && (
            <div className="settings-tab">
              <h3 className="section-title">Group Settings</h3>
              <div className="settings-section glass-inner">
                <h4 className="subsection-title">Group Information</h4>
                <div className="settings-info">
                  <p><strong>Name:</strong> {group.name}</p>
                  <p><strong>Category:</strong> {group.category}</p>
                  <p><strong>Privacy:</strong> {group.isPrivate ? "Private" : "Public"}</p>
                  <p><strong>Max Members:</strong> {group.maxMembers}</p>
                </div>
                <button onClick={() => navigate(`/group/${id}/edit`)} className="btn btn-primary">
                  Edit Group Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;