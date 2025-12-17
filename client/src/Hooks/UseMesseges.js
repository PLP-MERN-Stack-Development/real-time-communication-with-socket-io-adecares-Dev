import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useMessages = (roomId = null, privateChatId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socketService, currentUser } = useSocket();

  const addMessage = useCallback((message) => {
    setMessages(prev => {
      // Prevent duplicates
      if (prev.some(m => m._id === message._id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const markAsRead = useCallback((messageId) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, readBy: [...(msg.readBy || []), currentUser?.id] }
          : msg
      )
    );
  }, [currentUser]);

  const editMessage = useCallback((messageId, newText) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, text: newText, edited: true }
          : msg
      )
    );
  }, []);

  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  }, []);

  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleNewMessage = (message) => {
      if (
        (roomId && message.room === roomId) ||
        (privateChatId && 
          (message.sender === privateChatId || message.receiver === privateChatId))
      ) {
        addMessage(message);
      }
    };

    const handleMessageRead = ({ messageId, readerId }) => {
      if (readerId !== currentUser?.id) {
        markAsRead(messageId);
      }
    };

    socketService.on('newMessage', handleNewMessage);
    socketService.on('privateMessage', handleNewMessage);
    socketService.on('messageRead', handleMessageRead);

    return () => {
      socketService.off('newMessage', handleNewMessage);
      socketService.off('privateMessage', handleNewMessage);
      socketService.off('messageRead', handleMessageRead);
    };
  }, [socketService, roomId, privateChatId, addMessage, markAsRead, currentUser]);

  useEffect(() => {
    // Clear messages when room or chat changes
    setMessages([]);
  }, [roomId, privateChatId]);

  return {
    messages,
    setMessages,
    addMessage,
    markAsRead,
    editMessage,
    deleteMessage,
    loading,
    error
  };
};