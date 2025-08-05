import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  try {
    const { isDark, toggleTheme } = useTheme();

    return (
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <div className="toggle-track">
          <div className={`toggle-thumb ${isDark ? 'dark' : 'light'}`}>
            <span className="toggle-icon">
              {isDark ? '🌙' : '☀️'}
            </span>
          </div>
        </div>
      </button>
    );
  } catch (error) {
    // Fallback if theme context is not available
    return (
      <button className="theme-toggle" onClick={() => console.log('Theme toggle clicked')} aria-label="Toggle theme">
        <div className="toggle-track">
          <div className="toggle-thumb dark">
            <span className="toggle-icon">🌙</span>
          </div>
        </div>
      </button>
    );
  }
};

export default ThemeToggle;