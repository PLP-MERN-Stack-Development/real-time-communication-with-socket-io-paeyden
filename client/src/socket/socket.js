// socket.js - Socket.io client setup
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useSocket = (token) => {
  // authToken holds the currently-used JWT; allow initializing from hook param or localStorage
  const [authToken, setAuthToken] = useState(token || localStorage.getItem('token') || null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({}); // { convoId: [messages] }
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { conversationId: [usernames] }

  // ✅ Connect with user + token
  // ✅ Connect with user + token
  // connect(user, tokenArg) — tokenArg optional; falls back to hook `authToken` or localStorage
  const connect = (user, tokenArg) => {
    const tokenToUse = tokenArg || authToken || localStorage.getItem('token') || null;
    if (tokenToUse && tokenToUse !== authToken) setAuthToken(tokenToUse);

    socket.auth = { token: tokenToUse, user };
    socket.connect();
    if (user?._id) {
      socket.emit('user_connected', { _id: user._id, username: user.username });
    }
  };

  const disconnect = () => {
    socket.disconnect();
    setIsConnected(false);
  };

  // ✅ Fetch messages from backend
  const fetchMessages = async (conversationId) => {
    try {
      const tokenForRequest = authToken || localStorage.getItem('token') || '';
      const res = await fetch(`${SOCKET_URL}/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${tokenForRequest}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId.toString()]: data,
      }));
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ✅ Send message (ensure room join)
  const sendMessage = (conversationId, text, senderId) => {
    socket.emit("join_conversation", conversationId); // ensure joined
    socket.emit("send_message", { conversationId, text, senderId });
  };

  const sendPrivateMessage = (toUserId, message) => {
    socket.emit("private_message", { toUserId, message });
  };

  // ✅ Typing (debounced stop)
  let typingTimeout;
  const setTyping = (conversationId, username, isTyping) => {
    socket.emit("typing", { conversationId, username, isTyping });
    if (isTyping) {
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typing", { conversationId, username, isTyping: false });
      }, 2000);
    }
  };

  // ✅ Join conversation + fetch messages
  const joinConversation = (conversationId) => {
    socket.emit("join_conversation", conversationId);
    fetchMessages(conversationId);
  };

  // ✅ Register listeners once
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      if (socket.auth?.user) {
        socket.emit("user_connected", socket.auth.user);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessagesByConversation((prev) => {
        const convoId = message.conversationId.toString();
        const existing = prev[convoId] || [];
        return { ...prev, [convoId]: [...existing, message] };
      });
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
    };

    const onUserList = (userList) => {
      setUsers(userList); // must be {_id, username}
    };

    const onTypingUsers = ({ conversationId, users }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: users }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("private_message", onPrivateMessage);
    socket.on("user_list", onUserList);
    socket.on("typing_users", onTypingUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("private_message", onPrivateMessage);
      socket.off("user_list", onUserList);
      socket.off("typing_users", onTypingUsers);
    };
  }, [authToken]);

  return {
    socket,
    isConnected,
    lastMessage,
    messagesByConversation,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinConversation,
    fetchMessages,
  };
};

export default socket;