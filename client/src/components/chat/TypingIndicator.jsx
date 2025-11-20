import React from "react";
import { useSocket } from "../../socket/socket";

const TypingIndicator = ({ conversationId, currentUser }) => {
  const { typingUsers } = useSocket();

  // Get typing users for this conversation (array of usernames)
  const usersTyping = (typingUsers && typingUsers[conversationId]) || [];

  // Guard currentUser may be undefined; use optional chaining
  const myUsername = currentUser?.username || null;

  // Filter out yourself so you only see others typing
  const othersTyping = usersTyping.filter((username) => username && username !== myUsername);

  if (othersTyping.length === 0) return null;

  return (
    <div className="p-2 text-sm text-gray-500">
      {othersTyping.join(", ")} {othersTyping.length > 1 ? "are" : "is"} typing...
    </div>
  );
};

export default TypingIndicator;