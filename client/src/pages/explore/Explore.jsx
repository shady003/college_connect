import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./Explore.scss";

const Explore = () => {
  const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const categories = {
    groups: ["Academic", "Social", "Technical", "Sports", "Cultural", "Other"],
    events: ["Workshop", "Seminar", "Meetup", "Competition", "Cultural", "Sports", "Other"],
    resources: ["Study Material", "Notes", "Assignment", "Project", "Tutorial", "Reference", "Other"]
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let params = new URLSearchParams();
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      switch (activeTab) {
        case "groups":
          endpoint = "/groups/public";
          break;
        case "events":
          endpoint = "/events";
          break;
        case "resources":
          endpoint = "/resources";
          break;
        default:
          endpoint = "/groups";
      }

      console.log('Fetching from:', `${endpoint}?${params.toString()}`);
      const response = await newRequest.get(`${endpoint}?${params.toString()}`);
      console.log('Response:', response.data);
      
      switch (activeTab) {
        case "groups":
          const groupsData = response.data.groups || response.data || [];
          console.log('Setting groups:', groupsData);
          setGroups(groupsData);
          break;
        case "events":
          setEvents(response.data.events || response.data || []);
          break;
        case "resources":
          setResources(response.data.resources || response.data || []);
          break;
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await newRequest.post(`/groups/${groupId}/join`);
      alert(response.data.message || "Successfully joined group!");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to join group:", err);
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  const handleAttendEvent = async (eventId) => {
    try {
      await newRequest.post(`/events/${eventId}/attend`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to attend event:", err);
    }
  };

  const handleDownloadResource = async (resourceId) => {
    try {
      await newRequest.post(`/resources/${resourceId}/download`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to download resource:", err);
    }
  };

  return (
    <div className="explore">
      <div className="explore-header glass-card">
        <h1 className="gradient-text">Explore CollegeConnect</h1>
        <p>Discover groups, events, and resources from students across colleges</p>
      </div>

      {/* Search and Filter */}
      <div className="search-filter glass-card">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories[activeTab]?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="explore-nav glass-card">
        <button
          className={`btn ${activeTab === "groups" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("groups")}
        >
          Groups ({groups.length})
        </button>
        <button
          className={`btn ${activeTab === "events" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("events")}
        >
          Events ({events.length})
        </button>
        <button
          className={`btn ${activeTab === "resources" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("resources")}
        >
          Resources ({resources.length})
        </button>
      </nav>

      {/* Content */}
      <div className="explore-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === "groups" && (
              <div className="groups-section">
                <div className="section-header glass-card">
                  <h2 className="gradient-text">Student Groups</h2>
                  <button onClick={() => navigate("/create-group")} className="btn btn-primary">
                    Create Group
                  </button>
                </div>
                <div className="groups-grid">
                  {groups.map((group) => (
                    <div key={group._id} className="group-card glass-card">
                      <div className="group-header">
                        <h3>{group.name}</h3>
                        <span className="category">{group.category}</span>
                      </div>
                      <p className="description">{group.description}</p>
                      <div className="group-stats">
                        <span>👥 {group.members?.length || 0} members</span>
                        <span>{group.isPrivate ? "🔒 Private" : "🌐 Public"}</span>
                      </div>
                      <div className="group-actions">
                        <button onClick={() => navigate(`/group/${group._id}`)} className="btn btn-secondary">
                          View Details
                        </button>
                        {group.userStatus?.isMember ? (
                          <button className="joined-btn" disabled>
                            ✓ Joined
                          </button>
                        ) : group.userStatus?.hasJoinRequest ? (
                          <button className="pending-btn" disabled>
                            Request Sent
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinGroup(group._id)}
                            className="btn btn-primary"
                          >
                            {group.isPrivate ? "Request to Join" : "Join Group"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="empty-state">
                      <h3>No groups found</h3>
                      <p>Try adjusting your search or create a new group!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="events-section">
                <div className="section-header">
                  <h2>Upcoming Events</h2>
                  <button onClick={() => navigate("/create-event")} className="create-btn">
                    Create Event
                  </button>
                </div>
                <div className="events-grid">
                  {events.map((event) => (
                    <div key={event._id} className="event-card">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <span className="category">{event.category}</span>
                      </div>
                      <p className="description">{event.description}</p>
                      <div className="event-details">
                        <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                        <span>📍 {event.location?.type || "TBD"}</span>
                        <span>👥 {event.attendees?.length || 0} attending</span>
                      </div>
                      <div className="event-actions">
                        <button onClick={() => navigate(`/event/${event._id}`)}>
                          View Details
                        </button>
                        <button 
                          onClick={() => handleAttendEvent(event._id)}
                          className="attend-btn"
                        >
                          Attend Event
                        </button>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="empty-state">
                      <h3>No events found</h3>
                      <p>Try adjusting your search or create a new event!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="resources-section">
                <div className="section-header">
                  <h2>Study Resources</h2>
                  <button onClick={() => navigate("/share-resource")} className="create-btn">
                    Share Resource
                  </button>
                </div>
                <div className="resources-grid">
                  {resources.map((resource) => (
                    <div key={resource._id} className="resource-card">
                      <div className="resource-header">
                        <h3>{resource.title}</h3>
                        <span className="type">{resource.type}</span>
                      </div>
                      <p className="description">{resource.description}</p>
                      <div className="resource-details">
                        <span>📚 {resource.subject}</span>
                        <span>⬇️ {resource.downloads} downloads</span>
                        <span>⭐ {resource.rating?.average?.toFixed(1) || 0}/5</span>
                      </div>
                      <div className="resource-actions">
                        <button onClick={() => navigate(`/resource/${resource._id}`)}>
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDownloadResource(resource._id)}
                          className="download-btn"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                  {resources.length === 0 && (
                    <div className="empty-state">
                      <h3>No resources found</h3>
                      <p>Try adjusting your search or share your first resource!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore; 