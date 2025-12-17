import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCamera, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const navigate = useNavigate();
  const { authenticateUser, isConnected } = useSocket();

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const generateAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&bold=true`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userAvatar = avatar.trim() || generateAvatar(username);
      
      const userData = {
        username: username.trim(),
        avatar: userAvatar,
        userId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      await authenticateUser(userData);
      
      // Navigate to chat
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    const demoUsers = [
      { username: 'Alice', color: 'FF6B6B' },
      { username: 'Bob', color: '4ECDC4' },
      { username: 'Charlie', color: '45B7D1' },
      { username: 'Diana', color: '96CEB4' }
    ];
    
    const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    const demoAvatar = `https://ui-avatars.com/api/?name=${randomUser.username}&background=${randomUser.color}&color=fff`;
    
    setUsername(randomUser.username);
    setAvatar(demoAvatar);
    
    try {
      const userData = {
        username: randomUser.username,
        avatar: demoAvatar,
        userId: `demo-${randomUser.username.toLowerCase()}-${Date.now()}`
      };

      await authenticateUser(userData);
      navigate('/chat');
    } catch (err) {
      setError('Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Socket.io Chat</h1>
            <p>Real-time messaging with WebSockets</p>
          </div>

          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}>
              {connectionStatus === 'connected' ? (
                <>
                  <FiWifi size={16} />
                  <span>Connected to server</span>
                </>
              ) : (
                <>
                  <FiWifiOff size={16} />
                  <span>Connecting to server...</span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">
                <FiUser className="icon" />
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter your username"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">
                <FiCamera className="icon" />
                Avatar URL (optional)
              </label>
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                disabled={loading}
              />
              
              <div className="avatar-preview">
                <img
                  src={avatar || generateAvatar(username)}
                  alt="Avatar preview"
                  className="preview-avatar"
                  onError={(e) => {
                    e.target.src = generateAvatar(username);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAvatar = generateAvatar(username);
                    setAvatar(newAvatar);
                  }}
                  className="random-avatar-btn"
                  disabled={loading}
                >
                  Generate Random
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="login-button"
                disabled={loading || !username.trim() || !isConnected}
              >
                {loading ? 'Joining...' : 'Join Chat'}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="demo-button"
                disabled={loading || !isConnected}
              >
                Try Demo Account
              </button>
            </div>

            <div className="login-features">
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time messaging</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Multiple chat rooms</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span>Private messages</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Responsive design</span>
              </div>
            </div>
          </form>

          <div className="login-footer">
            <p className="server-info">
              Server: {process.env.REACT_APP_SOCKET_SERVER_URL}
            </p>
            <p className="environment-info">
              Environment: {process.env.NODE_ENV || 'development'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;