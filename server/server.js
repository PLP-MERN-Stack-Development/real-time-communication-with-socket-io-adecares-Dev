const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// MongoDB Atlas Connection with better error handling
const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    
    // Use the connection string from your .env
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    console.log('Using MongoDB URI:', mongoURI.replace(/:[^:]*@/, ':****@')); // Hide password
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Listen to connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.log('\n⚠️  Possible solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your MongoDB Atlas credentials');
    console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if the database name is correct');
    console.log('\n💡 Using in-memory storage for now...');
    return false;
  }
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Health Check with MongoDB status
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  let mongoText;
  
  switch(mongoStatus) {
    case 0: mongoText = 'disconnected'; break;
    case 1: mongoText = 'connected'; break;
    case 2: mongoText = 'connecting'; break;
    case 3: mongoText = 'disconnecting'; break;
    default: mongoText = 'unknown';
  }
  
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    socketConnections: io.engine.clientsCount,
    mongodb: {
      status: mongoText,
      readyState: mongoStatus
    }
  });
});

// API Routes
app.get('/api/config', (req, res) => {
  res.json({
    serverUrl: `http://localhost:${process.env.PORT}`,
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'atlas' : 'in-memory',
    features: ['websocket', 'realtime-chat', 'rooms', 'private-messaging']
  });
});

// In-memory storage (fallback if MongoDB fails)
const users = new Map();
const rooms = new Map();
const typingUsers = new Map();

// Helper Functions
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default Rooms
const defaultRooms = [
  { id: 'general', name: 'General Chat', description: 'General discussion', users: 0 },
  { id: 'random', name: 'Random', description: 'Random topics', users: 0 },
  { id: 'help', name: 'Help & Support', description: 'Get help here', users: 0 },
  { id: 'tech', name: 'Tech Talk', description: 'Technology discussions', users: 0 }
];

// Store messages per room
const roomMessages = new Map();
defaultRooms.forEach(room => {
  roomMessages.set(room.id, []);
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id} from ${socket.handshake.address}`);
  
  // Send default rooms to new client
  socket.emit('rooms:list', defaultRooms);
  
  // Send server info
  socket.emit('server:info', {
    mongodb: mongoose.connection.readyState === 1 ? 'atlas' : 'in-memory',
    uptime: process.uptime()
  });
  
  // Handle user authentication
  socket.on('user:login', (userData) => {
    try {
      const user = {
        id: generateUserId(),
        socketId: socket.id,
        username: userData.username,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
        status: 'online',
        joinedAt: new Date()
      };
      
      users.set(socket.id, user);
      
      // Update rooms with user count
      const updatedRooms = defaultRooms.map(room => ({
        ...room,
        users: Array.from(rooms.get(room.id) || []).filter(sid => users.has(sid)).length
      }));
      
      // Notify others about new user
      socket.broadcast.emit('user:joined', {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        status: 'online'
      });
      
      // Send online users list to the new user
      const onlineUsers = Array.from(users.values()).map(u => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        status: u.status
      }));
      socket.emit('users:online', onlineUsers);
      
      // Send updated rooms list
      io.emit('rooms:list', updatedRooms);
      
      // Send success response
      socket.emit('user:authenticated', user);
      
      console.log(`👤 User logged in: ${user.username} (${socket.id})`);
    } catch (error) {
      console.error('Login error:', error);
      socket.emit('error', { message: 'Login failed', error: error.message });
    }
  });
  
  // Handle joining a room
  socket.on('room:join', ({ roomId, username }) => {
    try {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      rooms.get(roomId).add(socket.id);
      socket.join(roomId);
      
      const user = users.get(socket.id);
      if (user) {
        // Update room user count
        const updatedRooms = defaultRooms.map(room => ({
          ...room,
          users: Array.from(rooms.get(room.id) || []).filter(sid => users.has(sid)).length
        }));
        
        socket.to(roomId).emit('room:user-joined', {
          roomId,
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          },
          timestamp: new Date()
        });
        
        // Send room messages history
        const messages = roomMessages.get(roomId) || [];
        socket.emit('room:history', {
          roomId,
          messages: messages.slice(-50),
          users: Array.from(rooms.get(roomId)).map(sid => users.get(sid)).filter(Boolean)
        });
        
        // Broadcast updated rooms list
        io.emit('rooms:list', updatedRooms);
        
        console.log(`🚪 ${user.username} joined room: ${roomId}`);
      }
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room', error: error.message });
    }
  });
  
  // Handle leaving a room
  socket.on('room:leave', ({ roomId }) => {
    try {
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
      }
      socket.leave(roomId);
      
      const user = users.get(socket.id);
      if (user) {
        // Update room user count
        const updatedRooms = defaultRooms.map(room => ({
          ...room,
          users: Array.from(rooms.get(room.id) || []).filter(sid => users.has(sid)).length
        }));
        
        socket.to(roomId).emit('room:user-left', {
          roomId,
          userId: user.id,
          username: user.username,
          timestamp: new Date()
        });
        
        // Broadcast updated rooms list
        io.emit('rooms:list', updatedRooms);
      }
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });
  
  // Handle sending a message
  socket.on('message:send', (messageData) => {
    try {
      const { roomId, text } = messageData;
      const user = users.get(socket.id);
      
      if (!user) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        text,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        timestamp: new Date(),
        readBy: [user.id]
      };
      
      // Store message in memory
      if (!roomMessages.has(roomId)) {
        roomMessages.set(roomId, []);
      }
      roomMessages.get(roomId).push(message);
      
      // Keep only last 100 messages per room
      if (roomMessages.get(roomId).length > 100) {
        roomMessages.set(roomId, roomMessages.get(roomId).slice(-100));
      }
      
      // Try to save to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        // In a real app, you would save to MongoDB here
        // For now, we'll just log it
        console.log(`💾 Message would be saved to MongoDB: ${roomId}`);
      }
      
      // Broadcast to room
      io.to(roomId).emit('message:new', message);
      
      // Send confirmation to sender
      socket.emit('message:sent', message);
      
      console.log(`💬 ${user.username} sent message in ${roomId}: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  });
  
  // Handle typing indicator
  socket.on('user:typing', ({ roomId, isTyping }) => {
    try {
      const user = users.get(socket.id);
      if (!user) return;
      
      if (typingUsers.has(roomId)) {
        const roomTyping = typingUsers.get(roomId);
        if (roomTyping.has(user.id)) {
          clearTimeout(roomTyping.get(user.id));
          roomTyping.delete(user.id);
        }
      }
      
      if (isTyping) {
        const timeoutId = setTimeout(() => {
          socket.to(roomId).emit('user:stopped-typing', {
            roomId,
            userId: user.id
          });
          if (typingUsers.has(roomId)) {
            typingUsers.get(roomId).delete(user.id);
          }
        }, 3000);
        
        if (!typingUsers.has(roomId)) {
          typingUsers.set(roomId, new Map());
        }
        typingUsers.get(roomId).set(user.id, timeoutId);
        
        socket.to(roomId).emit('user:typing', {
          roomId,
          user: {
            id: user.id,
            username: user.username
          },
          isTyping: true
        });
      } else {
        socket.to(roomId).emit('user:stopped-typing', {
          roomId,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });
  
  // Handle message read receipt
  socket.on('message:read', ({ messageId, roomId }) => {
    try {
      const user = users.get(socket.id);
      if (!user) return;
      
      socket.to(roomId).emit('message:read-receipt', {
        messageId,
        userId: user.id,
        username: user.username,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Read receipt error:', error);
    }
  });
  
  // Handle private messages
  socket.on('message:private', ({ receiverId, text }) => {
    try {
      const sender = users.get(socket.id);
      if (!sender) return;
      
      let receiverSocketId = null;
      for (const [sid, user] of users.entries()) {
        if (user.id === receiverId) {
          receiverSocketId = sid;
          break;
        }
      }
      
      if (receiverSocketId) {
        const privateMessage = {
          id: `priv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          sender: {
            id: sender.id,
            username: sender.username,
            avatar: sender.avatar
          },
          receiverId,
          timestamp: new Date(),
          isPrivate: true
        };
        
        io.to(receiverSocketId).emit('message:private', privateMessage);
        socket.emit('message:private-sent', privateMessage);
        
        console.log(`🔒 ${sender.username} → ${receiverId}: ${text.substring(0, 50)}...`);
      } else {
        socket.emit('error', { message: 'User is offline', receiverId });
      }
    } catch (error) {
      console.error('Private message error:', error);
      socket.emit('error', { message: 'Failed to send private message', error: error.message });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id);
      
      if (user) {
        console.log(`👋 User disconnected: ${user.username} (${socket.id})`);
        
        rooms.forEach((roomUsers, roomId) => {
          if (roomUsers.has(socket.id)) {
            roomUsers.delete(socket.id);
            
            const updatedRooms = defaultRooms.map(room => ({
              ...room,
              users: Array.from(rooms.get(room.id) || []).filter(sid => users.has(sid)).length
            }));
            
            socket.to(roomId).emit('room:user-left', {
              roomId,
              userId: user.id,
              username: user.username,
              timestamp: new Date(),
              reason: 'disconnected'
            });
            
            io.emit('rooms:list', updatedRooms);
          }
        });
        
        users.delete(socket.id);
        
        io.emit('user:left', {
          id: user.id,
          username: user.username,
          timestamp: new Date()
        });
      }
      
      typingUsers.forEach((roomTyping) => {
        roomTyping.forEach((timeoutId) => {
          clearTimeout(timeoutId);
        });
      });
      
      console.log(`🔌 Connection closed: ${socket.id}`);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV}
  🔗 Client URL: ${process.env.CLIENT_URL}
  🗄️  MongoDB Atlas: Attempting connection...
  `);
});