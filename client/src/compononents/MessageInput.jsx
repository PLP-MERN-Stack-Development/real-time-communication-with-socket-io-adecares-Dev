import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSmile, FiImage, FiPaperclip } from 'react-icons/fi';
import { useTyping } from '../hooks/useTyping';

const MessageInput = ({ onSendMessage, roomId, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);
  const { startTyping, stopTyping, isTyping } = useTyping(roomId);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
      setRows(Math.floor(newHeight / 20));
    }
    
    // Handle typing indicator
    if (value.trim() && !isTyping) {
      startTyping();
    } else if (!value.trim() && isTyping) {
      stopTyping();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setRows(1);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      if (isTyping) {
        stopTyping();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlur = () => {
    if (isTyping) {
      stopTyping();
    }
  };

  useEffect(() => {
    return () => {
      if (isTyping) {
        stopTyping();
      }
    };
  }, [isTyping, stopTyping]);

  return (
    <div className="message-input">
      <div className="input-actions">
        <button className="input-action-btn">
          <FiSmile size={20} />
        </button>
        <button className="input-action-btn">
          <FiImage size={20} />
        </button>
        <button className="input-action-btn">
          <FiPaperclip size={20} />
        </button>
      </div>
      
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          className="message-textarea"
        />
      </div>
      
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="send-button"
      >
        <FiSend size={20} />
      </button>
    </div>
  );
};

export default MessageInput;