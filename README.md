# Socket.io Real-Time Chat Application 
 
A full-stack real-time chat application built with React, Node.js, Express, and Socket.io. 
 
## Features 
 
### Core Features 
- Real-time messaging using Socket.io 
- User authentication (register/login) 
- Multiple chat rooms 
- Online user presence 
- Typing indicators 
 
### Tech Stack 
 
#### Frontend 
- React 18 
- Socket.io-client 
- React Router DOM 
- Vite 
 
#### Backend 
- Node.js 
- Express.js 
- Socket.io 
- MongoDB with Mongoose 
- JWT for authentication 
- bcryptjs for password hashing 
 
## Project Structure 
 
\`\`\` 
socket-io-chat/ 
ÃÄÄ client/                 # React frontend 
³   ÃÄÄ src/ 
³   ³   ÃÄÄ components/     # Reusable components 
³   ³   ÃÄÄ context/        # React context providers 
³   ³   ÃÄÄ pages/          # Page components 
³   ³   ÀÄÄ App.jsx         # Main app component 
³   ÀÄÄ package.json 
ÃÄÄ server/                 # Node.js backend 
³   ÃÄÄ config/             # Configuration files 
³   ÃÄÄ models/             # MongoDB models 
³   ÃÄÄ routes/             # Express routes 
³   ÃÄÄ socket/             # Socket.io handlers 
³   ÀÄÄ server.js           # Main server file 
ÀÄÄ README.md               # This file 
\`\`\` 
 
## Getting Started 
 
### Prerequisites 
- Node.js (v18 or higher) 
- MongoDB (local or Atlas) 
- Git 
 
### Installation 
 
1. **Clone the repository** 
\`\`\`bash 
git clone https://github.com/YOUR_USERNAME/socket-io-chat-app.git 
cd socket-io-chat-app 
\`\`\` 
 
2. **Install server dependencies** 
\`\`\`bash 
cd server 
npm install 
\`\`\` 
 
3. **Install client dependencies** 
\`\`\`bash 
cd ../client 
npm install 
\`\`\` 
 
4. **Set up environment variables** 
 
Create \`server/.env\`: 
\`\`\`env 
PORT=5000 
MONGODB_URI=mongodb://localhost:27017/chat-app 
JWT_SECRET=your-super-secret-jwt-key-here 
CLIENT_URL=http://localhost:3000 
\`\`\` 
 
Create \`client/.env\`: 
\`\`\`env 
VITE_SERVER_URL=http://localhost:5000 
\`\`\` 
 
5. **Start MongoDB service** 
 
6. **Run the application** 
 
Terminal 1 (Server): 
\`\`\`bash 
cd server 
npm run dev 
\`\`\` 
 
Terminal 2 (Client): 
\`\`\`bash 
cd client 
npm run dev 
\`\`\` 
 
7. **Access the application** 
- Frontend: http://localhost:3000 
- Backend API: http://localhost:5000 
 
## API Documentation 
 
### Authentication Endpoints 
- \`POST /api/auth/register\` - User registration 
- \`POST /api/auth/login\` - User login 
 
### Socket.io Events 
 
#### Client to Server 
- \`join_room\` - Join a chat room 
- \`send_message\` - Send a message to room 
- \`typing_start\` - Start typing indicator 
- \`typing_stop\` - Stop typing indicator 
 
#### Server to Client 
- \`new_message\` - Receive new message 
- \`user_connected\` - User came online 
- \`user_disconnected\` - User went offline 
- \`user_typing\` - User started typing 
- \`user_stop_typing\` - User stopped typing 
 
## Screenshots 
 
*Add screenshots of your application here* 
 
## License 
MIT License 
