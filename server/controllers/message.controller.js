const Message = require('../models/Message');

class MessageController {
  static async saveMessage(messageData) {
    const message = new Message({
      text: messageData.text,
      sender: messageData.sender,
      receiver: messageData.receiver,
      room: messageData.room,
      readBy: messageData.readBy || [messageData.sender],
      timestamp: new Date()
    });
    
    await message.save();
    return message;
  }
  
  static async getRoomMessages(roomId, limit = 50) {
    return Message.find({ room: roomId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('sender', 'username avatar');
  }
  
  static async markAsRead(messageId, userId) {
    return Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
  }
  
  static async getPrivateMessages(user1, user2, limit = 50) {
    return Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('sender receiver', 'username avatar');
  }
}

module.exports = MessageController;