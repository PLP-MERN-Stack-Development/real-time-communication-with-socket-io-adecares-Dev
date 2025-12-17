import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider, useSocket } from './context/SocketContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import PrivateChatPage from './pages/PrivateChatPage';
import RoomPage from './pages/RoomPage';
import './App.css';

const AppContent = () => {
  const { currentUser, isConnected, connectionError } = useSocket();
  const [showConnectionError, setShowConnectionError] = useState(false);

  useEffect(() => {
    if (connectionError) {
      setShowConnectionError(true);
      const timer = setTimeout(() => setShowConnectionError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  if (!currentUser) {
    return <Login />;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/private/:userId" element={<PrivateChatPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="*" element={<Navigate to="/chat" />} />
        </Routes>
      </Router>

      {showConnectionError && (
        <div className="connection-error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">
              Connection Error: {connectionError}
            </span>
            <button 
              className="error-close"
              onClick={() => setShowConnectionError(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="connection-status-banner">
          <div className="status-content">
            <span className="status-icon">🔌</span>
            <span className="status-message">
              Connecting to server...
            </span>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;