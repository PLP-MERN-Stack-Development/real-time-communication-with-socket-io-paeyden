import React, { useState } from "react";
import { useSocket } from "../../socket/socket";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const MessageInput = ({ conversationId, currentUser }) => {
  const { sendMessage, setTyping } = useSocket();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(conversationId, text, currentUser._id);
      setText("");
      setTyping(conversationId, currentUser.username, false); // ✅ stop typing
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setTyping(conversationId, currentUser.username, true); // ✅ start typing
  };

  return (
    <div className="flex gap-2 p-2 border-t">
      <Input
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1"
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
};
export default MessageInput;