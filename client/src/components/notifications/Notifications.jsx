import React from 'react';
import { useNotification } from '../../context/NotificationContext.jsx';
import './Notifications.scss';

const Notifications = () => {
  const { notifications, loading, markAsRead } = useNotification();

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div>No notifications</div>;
  }

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      <ul>
        {notifications.map(notification => (
          <li 
            key={notification._id} 
            className={notification.isRead ? 'read' : 'unread'}
            onClick={() => markAsRead(notification._id)}
          >
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
