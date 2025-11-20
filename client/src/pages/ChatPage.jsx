import React from "react";
import ChatLayout from "../components/chat/ChatLayout";

const ChatPage = ({ user }) => {
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        You must be logged in to access the chat.
      </div>
    );
  }

  return <ChatLayout user={user} />;
};

export default ChatPage;