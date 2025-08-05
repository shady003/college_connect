import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { newRequest } from "../../utils/newRequest.js";
import "./CreateGroup.scss";

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Academic",
    isPrivate: false,
    tags: "",
    rules: "",
    maxMembers: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "Academic",
    "Social",
    "Technical",
    "Sports",
    "Cultural",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        rules: formData.rules.split(",").map((rule) => rule.trim()).filter(Boolean),
        maxMembers: Number(formData.maxMembers),
      };
      const response = await newRequest.post("/groups", payload);
      navigate(`/group/${response.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <h2>Create New Group</h2>
      <form onSubmit={handleSubmit} className="create-group-form">
        <label>
          Group Name *
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description *
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Category *
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        <label>
          Private Group
          <input
            type="checkbox"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
          />
        </label>

        <label>
          Tags (comma separated)
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. study, project, fun"
          />
        </label>

        <label>
          Rules (comma separated)
          <input
            type="text"
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="e.g. no spam, be respectful"
          />
        </label>

        <label>
          Maximum Members
          <input
            type="number"
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleChange}
            min={1}
            max={1000}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
