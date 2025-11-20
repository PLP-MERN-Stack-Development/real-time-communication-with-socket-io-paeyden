# Real-time Chat (Socket.io) — paeyden

This project is a real-time chat application built with a React/Vite front-end and an Express + Socket.io back-end. It supports direct and group conversations, message persistence in MongoDB, JWT-based authentication, typing indicators, and online presence.

Quick links
- Client: `client/`
- Server: `server/`

Goals
- Demonstrate real-time messaging with Socket.io.
- Provide a chat UI with conversation list, message stream, and typing indicators.
- Secure API endpoints using JWTs and protect socket handshake where applicable.

Features
- User registration and login (JWT authentication)
- Direct and group conversations
- Persistent messages in MongoDB
- Real-time message delivery via Socket.io
- Typing indicators and online user list
- Basic conversation management (create, list, fetch)

Tech stack
- Frontend: React + Vite
- Backend: Node.js, Express, Socket.io
- Database: MongoDB / Mongoose
- Auth: JSON Web Tokens (`jsonwebtoken`)

Repository layout
```
README.md
client/      # React + Vite app
server/      # Express + Socket.io API and websocket server
```

Prerequisites
- Node.js (>=16)
- npm
- MongoDB (local or remote)

Environment
Create a `.env` file in `server/` with the following values (example):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

On the client, you can set `VITE_SERVER_URL` / `VITE_SOCKET_URL` in `.env` (optional):
```
VITE_SERVER_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Setup & Run (PowerShell)
Server:
```powershell
cd server
npm install
npm start
```

Client (development):
```powershell
cd client
npm install
npm run dev
```

Basic usage
- Register a user via the client UI or POST `/api/users/register`.
- Login to receive a JWT — the client stores it in `localStorage` and attaches it to API requests and the socket handshake.
- Open conversations from the sidebar or start a new conversation from Online Users.

API endpoints (summary)
- POST `/api/users/register` — register a user
- POST `/api/users/login` — login and receive token
- GET `/api/users/profile` — protected, get profile
- GET `/api/conversations` — protected, get user's conversations
- POST `/api/conversations` — protected, create conversation
- GET `/api/conversations/:id` — protected, get conversation
- POST `/api/messages` — protected, create message

Socket events (client ↔ server)
- Handshake: client sets `socket.auth = { token, user }` before calling `socket.connect()`.
- Server verifies token (if present) and may attach `socket.userId`.
- emit: `user_connected` — client tells server which user is connected
- emit: `join_conversation` (conversationId) — join a room
- emit: `send_message` ({ conversationId, text, senderId? }) — create & broadcast message
- emit: `private_message` ({ toUserId, message }) — send private message
- emit: `typing` ({ conversationId, username, isTyping }) — typing indicator
- server broadcasts: `receive_message`, `private_message`, `user_list`, `typing_users`

Troubleshooting
- 500 on `POST /api/conversations`: ensure the `participants` array contains valid user IDs (ObjectId strings) and the request is authenticated.
- JWT errors (`invalid signature`, `jwt malformed`): confirm `JWT_SECRET` is identical in the environment used to sign and verify tokens, and that the client sends only the token (not `Bearer ` prefix) to the socket handshake. Check `server/.env` for `JWT_SECRET` and ensure tokens are stored without surrounding quotes.
- Double-slash in API URLs (`//api/...`): ensure `VITE_SERVER_URL` doesn't include a trailing slash (client code trims it automatically).

Development notes
- Conversation creation from UI attempts to create or retrieve an existing direct conversation via the API and dispatches a local event (`conversation:created`) so the conversation list updates immediately.
- The client stores `token` and `user` in `localStorage` to restore sessions.

Contributing
- Fixes and improvements welcome. Open a PR and include a brief description.

License
- MIT (change if needed)

If you want, I can also add a short `DEVELOPMENT.md` with debugging steps (how to inspect JWTs, simulate socket events, or run unit tests).
# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Assignment Overview

You will build a chat application with the following features:
1. Real-time messaging using Socket.io
2. User authentication and presence
3. Multiple chat rooms or private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 