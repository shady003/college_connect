import React, { createContext, useContext, useState, useEffect } from 'react';
import { newRequest } from '../utils/newRequest.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await newRequest.get('/auth/profile');
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await newRequest.post('/auth/login', credentials);
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await newRequest.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const register = async (userData) => {
    try {
      const response = await newRequest.post('/auth/register', userData);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    } catch (err) {
      throw err;
    }
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 