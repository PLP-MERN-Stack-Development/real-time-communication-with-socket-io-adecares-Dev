const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuthMiddleware = async (socket, next) => {
  try {
    // For development/testing, allow anonymous connections
    if (process.env.NODE_ENV === 'development' && !socket.handshake.auth.token) {
      console.log('Development mode: Allowing anonymous connection');
      socket.user = {
        id: 'anonymous-' + socket.id,
        username: 'Anonymous',
        avatar: 'https://ui-avatars.com/api/?name=Anonymous&background=random'
      };
      return next();
    }
    
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user to socket
    socket.user = {
      id: user._id,
      username: user.username,
      avatar: user.avatar
    };
    
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      // For development, allow connection with anonymous user
      socket.user = {
        id: 'dev-' + socket.id,
        username: 'Dev User',
        avatar: 'https://ui-avatars.com/api/?name=Dev&background=random'
      };
      return next();
    }
    
    next(new Error('Authentication error: Invalid token'));
  }
};

const socketLoggerMiddleware = (socket, next) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || 
                   socket.handshake.address;
  console.log(`Socket connection attempt from: ${clientIp}`);
  next();
};

module.exports = {
  socketAuthMiddleware,
  socketLoggerMiddleware
};