import React from "react";
import "./Homepage.scss";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";

const Home = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="home" data-theme={isDark ? 'dark' : 'light'}>
      <ThemeToggle />
      {/* Hero Section with Scrolling Images */}
      <div className="hero">
        <div className="image-scroll">
        <img src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202206/Best-colleges-campus.jpg?VersionId=WEYuzm_.6U9nkeYJtK5JT602kZ3HGeH1" alt="College 4" />
          <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914" alt="College 1" />
          <img src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238" alt="College 2" />
        </div>
        <div className="overlay">
          <div className="glass-card hero-content">
            <h1 className="gradient-text">Welcome to CollegeConnect</h1>
            <p>Connect, Collaborate & Conquer College Life Together</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="about">
        <div className="glass-card about-content">
          <h2 className="gradient-text">About CollegeConnect</h2>
          <p>
            CollegeConnect is a student community platform that empowers students to share resources,
            join groups, attend events, and collaborate with peers from various colleges.
            We aim to build a space for students to stay informed and thrive academically and socially.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
