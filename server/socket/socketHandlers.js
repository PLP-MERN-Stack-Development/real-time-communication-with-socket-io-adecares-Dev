const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedUsers = new Map();

module.exports = (io) => {
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.username} connected`);

    // Add user to connected users
    connectedUsers.set(socket.userId.toString(), {
      socketId: socket.id,
      userId: socket.userId,
      username: socket.username,
      connectedAt: new Date()
    });

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Notify all users about new connection
    socket.broadcast.emit('user_connected', {
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date()
    });

    // Send current online users to the connected user
    const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
      userId: user.userId,
      username: user.username
    }));
    socket.emit('online_users', onlineUsers);

    // Handle joining rooms
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.username} joined room: ${roomId}`);
      
      // Notify room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        username: socket.username,
        roomId,
        timestamp: new Date()
      });
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      const { roomId, content } = data;
      
      // Emit to room
      io.to(roomId).emit('new_message', {
        room: roomId,
        content: content,
        sender: {
          id: socket.userId,
          username: socket.username
        },
        timestamp: new Date()
      });

      console.log(`Message sent to room ${roomId} by ${socket.username}`);
    });

    // Typing indicator
    socket.on('typing_start', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(roomId).emit('user_stop_typing', {
        userId: socket.userId,
        roomId
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.username} disconnected`);

      // Remove from connected users
      connectedUsers.delete(socket.userId.toString());

      // Update user online status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify all users about disconnection
      socket.broadcast.emit('user_disconnected', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      });
    });
  });
};