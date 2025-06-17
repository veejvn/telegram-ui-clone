"use client";

import React, { useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { useChatStore } from "@/stores/useChatStore";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessages = ({ roomId, messagesEndRef }: ChatMessagesProps) => {
  useTimeline(roomId);

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);

  const messages = messagesByRoom[roomId] ?? [];

  useEffect(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

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
          <div key={msg.eventId}>
            <ChatMessage  msg={msg} />
            <div ref={messagesEndRef} />
          </div>
        ))}
        {/* <div className="flex justify-end text-red-500">{lastMessage.status}</div> */}
      </div>
    </>
  );
};

export default ChatMessages;
