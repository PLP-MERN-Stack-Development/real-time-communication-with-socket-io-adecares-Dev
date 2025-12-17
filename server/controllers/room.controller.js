const Room = require('../models/Room');

class RoomController {
  static async createRoom(roomData) {
    const room = new Room({
      name: roomData.name,
      description: roomData.description,
      creator: roomData.creator,
      isPrivate: roomData.isPrivate || false,
      members: roomData.members || [roomData.creator]
    });
    
    await room.save();
    return room;
  }
  
  static async joinRoom(roomId, userId) {
    return Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }
  
  static async leaveRoom(roomId, userId) {
    return Room.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId } },
      { new: true }
    );
  }
  
  static async getRooms(userId) {
    return Room.find({
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    })
    .populate('creator', 'username')
    .populate('members', 'username avatar');
  }
  
  static async getRoomDetails(roomId) {
    return Room.findById(roomId)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status');
  }
}

module.exports = RoomController;