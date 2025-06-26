"use client";

import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { useChatStore } from "@/stores/useChatStore";
import { useSearchParams } from "next/navigation";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessages = ({ roomId, messagesEndRef }: ChatMessagesProps) => {
  useTimeline(roomId);

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const messages = messagesByRoom[roomId] ?? [];

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const firstHighlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightId && firstHighlightedRef.current) {
      firstHighlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, highlightId]);

  return (
    <div className="py-1.5">
      {messages.map((msg) => {
        const isHighlighted = msg.eventId === highlightId;

        return (
          <div
            key={msg.eventId}
            ref={isHighlighted ? firstHighlightedRef : null}
          >
            <ChatMessage msg={msg} />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
