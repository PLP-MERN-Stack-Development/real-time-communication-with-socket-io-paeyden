import React from "react";
import clsx from "clsx";

const MessageBubble = ({ message, currentUser }) => {
  const senderId =
    typeof message.senderId === "string"
      ? message.senderId
      : message.senderId?._id;

  const isOwnMessage = senderId === currentUser._id;

  return (
    <div className={clsx("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-xs px-4 py-2 rounded-lg",
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        )}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;