import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

const RoomPage = () => {
  const { roomId } = useParams();

  return (
    <div className="room-page">
      <ChatRoom
        roomId={roomId}
        roomName={roomId.charAt(0).toUpperCase() + roomId.slice(1)}
      />
    </div>
  );
};

export default RoomPage;