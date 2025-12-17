const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  LOGOUT: 'logout',
  
  // Room Events
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  CREATE_ROOM: 'createRoom',
  ROOM_CREATED: 'roomCreated',
  USER_JOINED_ROOM: 'userJoinedRoom',
  USER_LEFT_ROOM: 'userLeftRoom',
  
  // Message Events
  SEND_MESSAGE: 'sendMessage',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_SENT: 'messageSent',
  EDIT_MESSAGE: 'editMessage',
  DELETE_MESSAGE: 'deleteMessage',
  
  // Private Messages
  PRIVATE_MESSAGE: 'privateMessage',
  PRIVATE_MESSAGE_SENT: 'privateMessageSent',
  
  // User Events
  ONLINE_USERS: 'onlineUsers',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  USER_TYPING: 'userTyping',
  
  // Message Status
  TYPING: 'typing',
  MESSAGE_READ: 'messageRead',
  MESSAGE_DELIVERED: 'messageDelivered',
  
  // Room Data
  ROOM_MESSAGES: 'roomMessages',
  ROOM_INFO: 'roomInfo',
  
  // Error Events
  ERROR: 'error'
};

module.exports = EVENTS;