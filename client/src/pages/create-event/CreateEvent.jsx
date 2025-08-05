import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import upload from "../../utils/uplaod.js";
import { useAuth } from "../../context/AuthContext.jsx";

import "./CreateEvent.scss";

const CreateEvent = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/"); // Redirect non-admin users to homepage or access denied page
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    location: {
      type: "Physical",
      address: "",
      virtualLink: "",
      coordinates: {
        latitude: "",
        longitude: ""
      }
    },
    maxAttendees: "",
    isPrivate: false,
    tags: "",
    requirements: "",
    groupId: ""
  });

  const [groups, setGroups] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Removed duplicate navigate declaration here

  const categories = [
    "Workshop", "Seminar", "Meetup", "Competition", "Cultural", "Sports", "Other"
  ];

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const response = await newRequest.get("/groups");
      setGroups(response.data.groups || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name === "coordinates.latitude" || name === "coordinates.longitude") {
      const coordField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [coordField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress("Creating event...");

    try {
      // Upload cover image if provided
      let coverImageUrl = null;
      if (coverImage) {
        setProgress("Uploading cover image...");
        coverImageUrl = await upload(coverImage, "image");
      }

      // Prepare event data
      const eventData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        requirements: formData.requirements.split(",").map(req => req.trim()).filter(Boolean),
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        coverImage: coverImageUrl,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      // Remove empty location fields
      if (!eventData.location.address) delete eventData.location.address;
      if (!eventData.location.virtualLink) delete eventData.location.virtualLink;
      if (!eventData.location.coordinates.latitude) delete eventData.location.coordinates;

      setProgress("Saving event...");
      const response = await newRequest.post("/events", eventData);
      
      setProgress("Event created successfully! Redirecting...");
      setTimeout(() => {
        navigate(`/event/${response.data.event._id}`);
      }, 1000);

    } catch (err) {
      console.error("Create event error:", err);
      setProgress(`Failed to create event: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <div className="create-event-header">
        <h1>Create New Event</h1>
        <p>Organize workshops, seminars, meetups, and more for your student community</p>
      </div>

      {progress && (
        <div className="progress-indicator">
          <p>{progress}</p>
          {loading && <div className="loading-spinner"></div>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event in detail"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="groupId">Associated Group (Optional)</label>
              <select
                id="groupId"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
              >
                <option value="">No Group</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Date & Time</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date & Time *</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date & Time *</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          
          <div className="form-group">
            <label htmlFor="locationType">Event Type *</label>
            <select
              id="locationType"
              name="location.type"
              value={formData.location.type}
              onChange={handleChange}
              required
            >
              <option value="Physical">Physical Event</option>
              <option value="Virtual">Virtual Event</option>
              <option value="Hybrid">Hybrid Event</option>
            </select>
          </div>

          {formData.location.type === "Physical" && (
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Enter event address"
              />
            </div>
          )}

          {formData.location.type === "Virtual" && (
            <div className="form-group">
              <label htmlFor="virtualLink">Virtual Meeting Link</label>
              <input
                type="url"
                id="virtualLink"
                name="location.virtualLink"
                value={formData.location.virtualLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {formData.location.type === "Hybrid" && (
            <>
              <div className="form-group">
                <label htmlFor="address">Physical Address</label>
                <input
                  type="text"
                  id="address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Enter physical address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="virtualLink">Virtual Meeting Link</label>
                <input
                  type="url"
                  id="virtualLink"
                  name="location.virtualLink"
                  value={formData.location.virtualLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </>
          )}
        </div>

        <div className="form-section">
          <h3>Event Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxAttendees">Maximum Attendees</label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                />
                Private Event (Invite only)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="workshop, coding, beginners"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements (comma separated)</label>
            <input
              type="text"
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="laptop, basic knowledge, registration"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Cover Image</h3>
          
          <div className="form-group">
            <label htmlFor="coverImage">Event Cover Image</label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
            <small>Upload an image to make your event more attractive</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="create-btn">
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 