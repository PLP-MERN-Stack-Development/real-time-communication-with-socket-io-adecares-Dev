import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../socket/socket';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    socketService.connect();

    socketService.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketService.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socketService.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.on('typing', ({ username, isTyping, userId }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return [...prev.filter(u => u.userId !== userId), { username, userId }];
        } else {
          return prev.filter(u => u.userId !== userId);
        }
      });
    });

    socketService.on('userJoined', (user) => {
      setOnlineUsers(prev => [...prev, user]);
    });

    socketService.on('userLeft', (user) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const authenticateUser = (userData) => {
    setCurrentUser(userData);
    socketService.authenticate(userData);
  };

  const joinRoom = (roomId, username) => {
    socketService.joinRoom(roomId, username);
  };

  const sendMessage = (messageData) => {
    socketService.sendMessage(messageData);
  };

  const sendTypingIndicator = (roomId, username, isTyping) => {
    socketService.sendTypingIndicator(roomId, username, isTyping);
  };

  const sendReadReceipt = (messageId, roomId, userId) => {
    socketService.sendReadReceipt(messageId, roomId, userId);
  };

  const sendPrivateMessage = (receiverId, text) => {
    socketService.sendPrivateMessage(receiverId, text, currentUser);
  };

  const value = {
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    currentUser,
    authenticateUser,
    joinRoom,
    sendMessage,
    sendTypingIndicator,
    sendReadReceipt,
    sendPrivateMessage,
    setMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};