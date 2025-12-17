import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useMessages } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { FiUser } from 'react-icons/fi';

const PrivateChat = () => {
  const { userId } = useParams();
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socketService, currentUser, onlineUsers } = useSocket();
  const { messages, addMessage } = useMessages(null, userId);

  useEffect(() => {
    // Find receiver from online users
    const foundReceiver = onlineUsers.find(user => user.id === userId);
    if (foundReceiver) {
      setReceiver(foundReceiver);
    } else {
      // In a real app, fetch user details from API
      setReceiver({
        id: userId,
        username: 'Unknown User',
        status: 'offline'
      });
    }
    setLoading(false);
  }, [userId, onlineUsers]);

  const handleSendMessage = (text) => {
    if (!currentUser || !receiver) return;

    const messageData = {
      text,
      senderId: currentUser.id,
      receiverId: receiver.id,
      timestamp: new Date().toISOString()
    };

    socketService.sendPrivateMessage(receiver.id, text, currentUser);
    addMessage({
      ...messageData,
      sender: currentUser,
      receiver: receiver
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!receiver) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="private-chat">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="user-avatar">
            {receiver.avatar ? (
              <img src={receiver.avatar} alt={receiver.username} />
            ) : (
              <FiUser size={24} />
            )}
            <span className={`status-dot ${receiver.status}`} />
          </div>
          <div className="user-details">
            <h3>{receiver.username}</h3>
            <span className="user-status">
              {receiver.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          onEditMessage={() => {}}
          onDeleteMessage={() => {}}
        />
      </div>

      <div className="message-input-container">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={`Message ${receiver.username}...`}
        />
      </div>
    </div>
  );
};

export default PrivateChat;