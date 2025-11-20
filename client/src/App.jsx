import React, { useState, useEffect } from "react";
import Navbar from "../src/components/NavBar";
import LoginPage from "../src/pages/LoginPage";
import RegisterPage from "../src/pages/RegisterPage";
import ChatPage from "../src/pages/ChatPage";
import ProfilePage from "../src/pages/ProfilePage";
import { Toaster } from "../src/components/ui/sonner"; // global toast provider

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // "login" | "register" | "chat" | "profile"

  // 🔒 Restore login state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        setView("chat");
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user"); // cleanup bad value
      }
    }
  }, []);

  // ✅ Handle login: save both user + token
  const handleLogin = ({ user, token }) => {
    if (!user || !token) return; // guard against bad data
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setView("chat");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setView("login");
  };

  // ✅ Route protection
  const protectedView = () => {
    if (!user && (view === "chat" || view === "profile")) return "login";
    return view;
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Navbar always visible */}
      <Navbar user={user} onNavigate={setView} onLogout={handleLogout} />

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {protectedView() === "login" && <LoginPage onLogin={handleLogin} />}
        {protectedView() === "register" && (
          <RegisterPage onRegister={() => setView("login")} />
        )}
        {protectedView() === "chat" && <ChatPage user={user} />}
        {protectedView() === "profile" && (
          <ProfilePage user={user} onUpdate={setUser} />
        )}
      </div>

      {/* Toast notifications */}
      <Toaster richColors />
    </div>
  );
}

export default App;