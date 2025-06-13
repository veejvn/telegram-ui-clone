import React from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { useChatStore } from "@/stores/useChatStore";

const ChatMessages = ({ roomId }: { roomId: string }) => {
  useTimeline(roomId);

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);

  const messages = messagesByRoom[roomId] ?? [];

  return (
    <>
      <div className="py-1.5">
        {/* <div className="text-center text-sm">
          <p
            className=" bg-gray-500/10 rounded-full backdrop-blur-sm 
            text-white inline-block px-1.5"
          >
            Today
          </p>
        </div> */}
        {messages.map((msg) => (
          <ChatMessage key={msg.eventId} msg={msg} />
        ))}
      </div>
    </>
  );
};

export default ChatMessages;
