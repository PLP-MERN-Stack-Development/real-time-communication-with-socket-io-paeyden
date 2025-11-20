import React, { useEffect, useState } from "react";
import { getUserConversations } from "../../services/api";
import { useSocket } from "../../socket/socket";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const ConversationList = ({ onSelectConversation }) => {
  const { joinConversation } = useSocket();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await getUserConversations();
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };
    fetchConversations();
    // Listen for client-side conversation created events and prepend
    const onCreated = (e) => {
      const convo = e.detail;
      if (!convo || !convo._id) return;
      setConversations((prev) => {
        // avoid duplicates
        if (prev.find((c) => c._id === convo._id)) return prev;
        return [convo, ...prev];
      });
    };
    window.addEventListener('conversation:created', onCreated);
    return () => window.removeEventListener('conversation:created', onCreated);
  }, []);

  const handleJoin = (conversation) => {
    joinConversation(conversation._id);
    onSelectConversation(conversation);
  };

  return (
    <Card className="p-4 space-y-2">
      <h3 className="font-semibold mb-2">Conversations</h3>
      {conversations.length === 0 ? (
        <p className="text-sm text-gray-500">No conversations yet</p>
      ) : (
        conversations.map((conv) => (
          <Button
            key={conv._id}
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleJoin(conv)}
          >
            {conv.type === "group"
              ? conv.groupName || "Unnamed Group"
              : conv.participants
                  .map((p) => p.username)
                  .filter((name) => name) // avoid empty
                  .join(", ")}
          </Button>
        ))
      )}
    </Card>
  );
};

export default ConversationList;