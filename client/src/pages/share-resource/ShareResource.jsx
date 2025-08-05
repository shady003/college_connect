import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./ShareResource.scss";

const ShareResource = () => {
  const [formData, setFormData] = useState({
    title: "",
    fileUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await newRequest.post("/resources", formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-resource">
      <div className="share-resource-header">
        <h1>Share Resource</h1>
        <p>Help fellow students by sharing educational resources</p>
      </div>

      <form onSubmit={handleSubmit} className="share-resource-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter resource title"
          />
        </div>

        <div className="form-group">
          <label>File URL *</label>
          <input
            type="url"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleChange}
            required
            placeholder="https://drive.google.com/..."
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Sharing..." : "Share Resource"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareResource;