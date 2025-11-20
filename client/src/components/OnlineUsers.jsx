import React from "react";
import { Button } from "../components/ui/button";
import { useSocketContext } from "../context/SocketProvider";
import { createConversation } from "../services/api";

const OnlineUsers = ({ currentUser, onStartConversation }) => {
  const { users, socket } = useSocketContext();

  return (
    <div className="p-4 border-r w-64">
      <h4 className="font-bold mb-2">Online Users</h4>
      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No users online</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span>{u.username}</span>
              <Button
                size="sm"
                onClick={async () => {
                  // currentUser should be provided by ChatLayout; guard just in case
                  if (!currentUser || !currentUser._id) {
                    console.warn('No current user available; opening temporary conversation');
                    onStartConversation({ _id: u._id, username: u.username });
                    return;
                  }
                  try {
                    // Create or get existing direct conversation between current user and selected user
                    const { data } = await createConversation({ participants: [currentUser._id, u._id], isGroup: false });
                    const convo = data || { _id: u._id, participants: [u] };

                    // Notify ConversationList locally via DOM event so it can prepend the new convo
                    window.dispatchEvent(new CustomEvent('conversation:created', { detail: convo }));

                    // Optionally notify server peers via socket (non-essential)
                    try { socket?.emit && socket.emit('conversation_created', convo); } catch(e) {}

                    // Select conversation in UI
                    onStartConversation(convo);
                  } catch (err) {
                    console.error('Failed to create/get conversation', err);
                    // fallback: open a temporary conversation object
                    onStartConversation({ _id: u._id, username: u.username });
                  }
                }}
              >
                Chat
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnlineUsers;