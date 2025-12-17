import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useTyping = (roomId = null) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socketService, currentUser } = useSocket();

  const startTyping = useCallback(() => {
    if (!isTyping && roomId) {
      setIsTyping(true);
      socketService.sendTypingIndicator(roomId, currentUser?.id, true);
    }
  }, [isTyping, roomId, socketService, currentUser]);

  const stopTyping = useCallback(() => {
    if (isTyping && roomId) {
      setIsTyping(false);
      socketService.sendTypingIndicator(roomId, currentUser?.id, false);
    }
  }, [isTyping, roomId, socketService, currentUser]);

  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleUserTyping = ({ userId, isTyping: userIsTyping, username }) => {
      setTypingUsers(prev => {
        if (userIsTyping) {
          return [...prev.filter(u => u.userId !== userId), { userId, username }];
        } else {
          return prev.filter(u => u.userId !== userId);
        }
      });
    };

    socketService.on('userTyping', handleUserTyping);

    return () => {
      socketService.off('userTyping', handleUserTyping);
    };
  }, [socketService]);

  useEffect(() => {
    let timeout;
    
    if (isTyping) {
      timeout = setTimeout(() => {
        stopTyping();
      }, 3000); // Auto-stop typing after 3 seconds
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isTyping, stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    setIsTyping
  };
};