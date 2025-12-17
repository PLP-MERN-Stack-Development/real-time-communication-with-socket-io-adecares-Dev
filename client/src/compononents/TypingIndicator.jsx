import React from 'react';
import { useTyping } from '../hooks/useTyping';

const TypingIndicator = ({ roomId }) => {
  const { typingUsers } = useTyping(roomId);

  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    }
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
  };

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <span className="typing-text">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;