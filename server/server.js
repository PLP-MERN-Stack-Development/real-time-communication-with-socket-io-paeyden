// server.js - final version
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const connectDB = require('./config/db'); // your existing db connector

// controllers/routes (you already have these)
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

// models
const User = require('./models/user');
const Message = require('./models/message');
const Conversation = require('./models/conversation');

const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// ----------------- Middleware -----------------
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// static if needed
app.use(express.static('public'));

// ----------------- Connect DB -----------------
connectDB().then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error', err);
});

// ----------------- API routes -----------------
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// ----------------- Socket.IO -----------------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// online user tracking:
// userId -> Set(socketId)
const userSockets = new Map();
// socketId -> user { _id, username }
const socketToUser = new Map();

// helper: emit current online users as array of { _id, username, socketCount }
async function emitOnlineUsers() {
  const users = [];
  for (const [userId, sockets] of userSockets.entries()) {
    // try fetch username if not available
    let username = null;
    // check one socket for stored username
    for (const s of sockets) {
      const u = socketToUser.get(s);
      if (u && u.username) {
        username = u.username;
        break;
      }
    }
    // fall back to DB lookup if username missing
    if (!username) {
      try {
        const uDoc = await User.findById(userId).select('username');
        username = uDoc?.username || 'Unknown';
      } catch (err) {
        username = 'Unknown';
      }
    }
    users.push({ _id: userId, username, socketCount: sockets.size });
  }
  io.emit('user_list', users);
}

io.use((socket, next) => {
  // optional JWT handshake: if client sends token in socket.auth.token, verify and attach userId
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // allow unauthenticated sockets (they can still emit user_connected)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    return next();
  } catch (err) {
    // Log a short preview of token to help debug malformed tokens (don't print full token)
    try {
      const tstr = typeof token === 'string' ? token : String(token);
      const preview = `${tstr.slice(0, 20)}${tstr.length > 20 ? '...' : ''}`;
      console.warn('Socket JWT verify failed:', err.message, 'tokenPreview:', preview);
    } catch (e) {
      console.warn('Socket JWT verify failed:', err.message);
    }
    // allow connection but not attach userId - client may still send user_connected manually
    return next();
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  // If handshake contained userId (from token), register it automatically
  if (socket.userId) {
    const userId = socket.userId.toString();
    const userEntry = { _id: userId, username: null }; // username may be filled from DB or user_connected event
    // store mapping
    socketToUser.set(socket.id, userEntry);
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
    emitOnlineUsers();
  }

  // Client can explicitly declare user after login (preferred for username availability)
  socket.on('user_connected', async (user) => {
    // user: { _id, username }
    if (!user || !user._id) return;
    socketToUser.set(socket.id, { _id: user._id.toString(), username: user.username || null });

    if (!userSockets.has(user._id)) userSockets.set(user._id, new Set());
    userSockets.get(user._id).add(socket.id);

    // Optionally mark user online in DB
    try {
      await User.findByIdAndUpdate(user._id, { isOnline: true }, { new: true }).exec();
    } catch (err) {
      // non-fatal
    }

    console.log(`👥 user_connected: ${user.username} (${user._id}), sockets: ${userSockets.get(user._id).size}`);
    emitOnlineUsers();
  });

  // Join room
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`📥 Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Typing indicator
  // payload: { conversationId, username, isTyping }
  socket.on('typing', ({ conversationId, username, isTyping }) => {
    if (!conversationId) return;
    io.to(conversationId).emit('typing_users', { conversationId, users: isTyping ? [username] : [] });
  });

  // Send message (socket) - this will persist to DB and broadcast the saved message
  // payload: { conversationId, text, senderId }  (senderId optional if socket.userId exists)
  socket.on('send_message', async (payload) => {
    try {
      const conversationId = payload.conversationId;
      const text = payload.text;
      const senderId = payload.senderId || socketToUser.get(socket.id)?._id || socket.userId;
      if (!conversationId || !text || !senderId) {
        console.warn('send_message missing conversationId/text/senderId', payload);
        return;
      }

      // create and save message
      const newMessage = new Message({
        conversationId,
        senderId,
        text,
        status: 'sent',
      });

      await newMessage.save();

      // update conversation lastMessage reference
      await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id, updatedAt: Date.now() }).exec();

      // populate sender fields
      const populated = await Message.findById(newMessage._id)
        .populate('senderId', 'username avatar')
        .exec();

      // broadcast to room
      io.to(conversationId).emit('receive_message', {
        _id: populated._id,
        conversationId,
        text: populated.text,
        senderId: populated.senderId,    // object with _id and username
        status: populated.status,
        createdAt: populated.createdAt,
      });

      console.log(`📨 Message saved + broadcasted for conversation ${conversationId}`);
    } catch (err) {
      console.error('❌ Error in send_message socket handler:', err);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });

  // Private message (socket-to-socket)
  // payload: { toUserId, message }
  socket.on('private_message', ({ toUserId, message }) => {
    if (!toUserId) return;
    const sockets = userSockets.get(toUserId);
    const sender = socketToUser.get(socket.id) || null;
    const payload = {
      message,
      from: sender?.username || null,
      fromId: sender?._id || null,
      createdAt: new Date().toISOString(),
    };
    if (sockets) {
      for (const sId of sockets) {
        io.to(sId).emit('private_message', payload);
      }
    } else {
      // user offline - you can store offline messages here
      socket.emit('private_message_sent_offline', payload);
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('❌ Socket disconnected:', socket.id);

    const userEntry = socketToUser.get(socket.id);
    if (userEntry) {
      const userId = userEntry._id;
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(userId);
          // optionally mark user offline in DB
          try {
            await User.findByIdAndUpdate(userId, { isOnline: false }).exec();
          } catch (err) {}
        } else {
          userSockets.set(userId, set);
        }
      }
    }
    socketToUser.delete(socket.id);

    // emit fresh online list
    emitOnlineUsers();
  });

}); // end io.on('connection')

// ----------------- Root -----------------
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// ----------------- Start -----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = { app, server, io };
