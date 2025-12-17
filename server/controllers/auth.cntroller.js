const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthController {
  static async login(socket, data) {
    const { username, password } = data;
    
    // In a real app, validate against database
    const user = await User.findOne({ username });
    
    if (!user) {
      // Create new user for demo
      const newUser = new User({
        username,
        socketId: socket.id,
        status: 'online',
        lastSeen: new Date()
      });
      await newUser.save();
      
      return {
        success: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          status: newUser.status,
          socketId: socket.id
        }
      };
    }
    
    // Update existing user
    user.socketId = socket.id;
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();
    
    return {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        status: user.status,
        socketId: socket.id
      }
    };
  }
  
  static async logout(socket) {
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      await user.save();
    }
    
    return { success: true };
  }
  
  static generateToken(user) {
    return jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'chat-app-secret',
      { expiresIn: '24h' }
    );
  }
}

module.exports = AuthController;