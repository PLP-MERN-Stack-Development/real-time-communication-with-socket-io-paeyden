import React from "react";
import { Button } from "../components/ui/button";

const Navbar = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <h1 className="text-lg font-bold">My Chat App</h1>
      <div className="space-x-2">
        {user ? (
          <>
            <Button variant="outline" onClick={() => onNavigate("chat")}>
              Chat
            </Button>
            <Button variant="outline" onClick={() => onNavigate("profile")}>
              Profile
            </Button>
            <Button variant="destructive" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => onNavigate("login")}>
              Login
            </Button>
            <Button variant="outline" onClick={() => onNavigate("register")}>
              Register
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;