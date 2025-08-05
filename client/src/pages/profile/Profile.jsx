import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { newRequest } from '../../utils/newRequest.js';
import './Profile.scss';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    college_name: user?.college_name || '',
    year: user?.year || '',
    branch: user?.branch || '',
    course: user?.course || '',
    rollno: user?.rollno || '',
    contact: user?.contact || '',
    skills: user?.skills?.join(', ') || '',
    profile_pic: user?.profile_pic || '',
    resume: user?.resume || ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      const response = await newRequest.put(`/users/${user.id}`, updateData);
      updateUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      college_name: user?.college_name || '',
      year: user?.year || '',
      branch: user?.branch || '',
      course: user?.course || '',
      rollno: user?.rollno || '',
      contact: user?.contact || '',
      skills: user?.skills?.join(', ') || '',
      profile_pic: user?.profile_pic || '',
      resume: user?.resume || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff&size=120`}
              alt="Profile"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff&size=120`;
              }}
            />
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
            <span className="user-role">{user.role}</span>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSubmit} disabled={loading} className="save-btn">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.username}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.email}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.contact}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>College</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.college_name}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Course</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.course}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.branch}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Year</label>
                  {isEditing ? (
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  ) : (
                    <p>{user.year} Year</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Roll Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="rollno"
                      value={formData.rollno}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <p>{user.rollno}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Skills & Profile</h3>
              <div className="form-group">
                <label>Skills</label>
                {isEditing ? (
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Enter skills separated by commas"
                    rows="3"
                  />
                ) : (
                  <div className="skills-display">
                    {user.skills?.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Profile Picture URL</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="profile_pic"
                    value={formData.profile_pic}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                ) : (
                  <p>{user.profile_pic || 'Using default avatar'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Resume</label>
                {user.resume ? (
                  <a href={user.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                    View Resume
                  </a>
                ) : (
                  <p>No resume uploaded</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;