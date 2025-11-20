import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import OnlineUsers from "../OnlineUsers";
import { Card } from "@/components/ui/card";

const ChatLayout = ({ user }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <Card className="w-64 border-r p-4">
        <h3 className="font-semibold mb-4">Welcome, {user?.username}</h3>
        <ConversationList onSelectConversation={setActiveConversation} />

        {/* ✅ Only render OnlineUsers if user exists */}
        {user && (
          <OnlineUsers
            currentUser={user}
            onStartConversation={setActiveConversation}
          />
        )}
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* ✅ ChatWindow renders message bubbles */}
            <ChatWindow
              conversation={activeConversation}
              currentUser={user}
            />

            {/* ✅ Typing indicator */}
            <TypingIndicator conversationId={activeConversation._id} currentUser={user} />

            {/* ✅ MessageInput handles sending */}
            <MessageInput
              conversationId={activeConversation._id}
              currentUser={user}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;