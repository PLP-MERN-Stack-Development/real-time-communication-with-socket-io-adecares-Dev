import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socketService } = useSocket();

  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleNewMessage = (message) => {
      // Don't show notification for current room messages
      if (document.visibilityState === 'visible') return;

      addNotification({
        id: Date.now(),
        type: 'message',
        title: `New message from ${message.sender?.username}`,
        content: message.text,
        timestamp: new Date()
      });
    };

    const handleUserOnline = (user) => {
      addNotification({
        id: Date.now(),
        type: 'user',
        title: `${user.username} is now online`,
        content: 'User has joined the chat',
        timestamp: new Date()
      });
    };

    socketService.on('newMessage', handleNewMessage);
    socketService.on('userOnline', handleUserOnline);
    socketService.on('privateMessage', handleNewMessage);

    return () => {
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userOnline', handleUserOnline);
      socketService.off('privateMessage', handleNewMessage);
    };
  }, [socketService]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 latest
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-container">
      <button className="notification-bell" onClick={handleBellClick}>
        <FiBell size={20} />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <div className="notification-actions">
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="mark-all-btn">
                  <FiCheck size={14} />
                  Mark all as read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.content}</div>
                    <div className="notification-time">
                      {new Date(notif.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="notification-remove"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;