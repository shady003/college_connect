import React, { createContext, useContext, useState, useEffect } from 'react';
import { newRequest } from '../utils/newRequest.js';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await newRequest.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await newRequest.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const value = {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
