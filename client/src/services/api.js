// client/src/services/api.js

import axios from "axios";

// Correct base URL handling: strip any trailing slash from VITE_SERVER_URL
const rawBase = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const BASE_URL = rawBase.replace(/\/$/, '');

// Base API instance (no duplicate slashes)
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // allow cookies + sessions
});

// Automatically attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: auto-logout when token expires
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("⛔ Token expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// -------------------
// Users
// -------------------
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const getUserProfile = () => API.get("/users/profile");
export const updateUserProfile = (data) => API.put("/users/profile", data);

// -------------------
// Messages
// -------------------
export const sendMessage = (data) => API.post("/messages", data);
export const getMessages = (conversationId) =>
  API.get(`/messages/${conversationId}`);
export const deleteMessage = (messageId) =>
  API.delete(`/messages/${messageId}`);
export const editMessage = (messageId, data) =>
  API.put(`/messages/${messageId}`, data);

// -------------------
// Conversations
// -------------------
export const createConversation = (data) => API.post("/conversations", data);
export const getUserConversations = () => API.get("/conversations");
export const getConversationById = (conversationId) =>
  API.get(`/conversations/${conversationId}`);
export const updateConversation = (conversationId, data) =>
  API.put(`/conversations/${conversationId}`, data);
export const deleteConversation = (conversationId) =>
  API.delete(`/conversations/${conversationId}`);
export const addParticipant = (conversationId, userId) =>
  API.post(`/conversations/${conversationId}/participants`, { userId });
export const removeParticipant = (conversationId, userId) =>
  API.delete(`/conversations/${conversationId}/participants`, {
    data: { userId },
  });

export default API;
