import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import RoomList from '../components/RoomList';
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/UserList';
import Notification from '../components/Notification';
import TypingIndicator from '../components/TypingIndicator';
import { FiLogOut, FiSettings, FiWifi, FiWifiOff } from 'react-icons/fi';

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState('general');
  const { currentUser, onlineUsers, socketService, isConnected } = useSocket(); // Add isConnected

  const handleSelectRoom = (roomId) => {
    setActiveRoom(roomId);
  };

  const handleLogout = () => {
    socketService.disconnect();
    window.location.reload();
  };

  if (!currentUser) {
    return <div>Please login first</div>;
  }

  return (
    <div className="chat-page">
      {/* MAIN HEADER WITH CONNECTION STATUS */}
      <div className="main-header">
        <div className="app-title">
          <h1>Socket.io Chat</h1>
          <span className="app-subtitle">Real-time messaging</span>
        </div>
        
        <div className="header-controls">
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            {isConnected ? (
              <FiWifi size={16} className="status-icon" />
            ) : (
              <FiWifiOff size={16} className="status-icon" />
            )}
          </div>
          
          <div className="user-profile-mini">
            <img src={currentUser.avatar} alt={currentUser.username} className="mini-avatar" />
            <span className="mini-username">{currentUser.username}</span>
          </div>
          
          <button className="icon-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
          </button>
        </div>
      </div>

      <div className="chat-layout">
        <div className="sidebar">
          <RoomList
            activeRoom={activeRoom}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        <div className="main-content">
          <ChatRoom
            roomId={activeRoom}
            roomName={activeRoom.charAt(0).toUpperCase() + activeRoom.slice(1)}
          />
          <TypingIndicator roomId={activeRoom} />
        </div>

        <div className="right-sidebar">
          <UserList />
          <Notification />
          <div className="online-stats">
            <div className="stat-item">
              <span className="stat-label">Online Users:</span>
              <span className="stat-value">{onlineUsers.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Rooms:</span>
              <span className="stat-value">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;