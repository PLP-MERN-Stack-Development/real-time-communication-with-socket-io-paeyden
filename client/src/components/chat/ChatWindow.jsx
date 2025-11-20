import React, { useEffect } from "react";
import { useSocket } from "../../socket/socket";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ conversation, currentUser }) => {
  const { messagesByConversation, joinConversation } = useSocket();

  useEffect(() => {
    if (conversation?._id) {
      // Join the socket room and fetch messages from backend
      joinConversation(conversation._id);
    }
  }, [conversation]);

  // Get messages for this conversation only
  const convoMessages = messagesByConversation[conversation?._id?.toString()] || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {convoMessages.map((m) => (
        <MessageBubble
          key={m._id} // use message id instead of index
          message={m}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default ChatWindow;