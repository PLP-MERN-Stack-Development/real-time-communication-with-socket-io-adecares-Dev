const User = require('../models/User');

class UserController {
  static async getOnlineUsers() {
    return User.find({ status: 'online' })
      .select('username avatar status socketId lastSeen');
  }
  
  static async getUserById(userId) {
    return User.findById(userId)
      .select('username avatar status socketId lastSeen');
  }
  
  static async updateUserStatus(userId, status) {
    return User.findByIdAndUpdate(
      userId,
      { 
        status,
        lastSeen: new Date()
      },
      { new: true }
    );
  }
  
  static async updateSocketId(userId, socketId) {
    return User.findByIdAndUpdate(
      userId,
      { socketId },
      { new: true }
    );
  }
  
  static async searchUsers(query) {
    return User.find({
      username: { $regex: query, $options: 'i' }
    })
    .select('username avatar status')
    .limit(10);
  }
}

module.exports = UserController;