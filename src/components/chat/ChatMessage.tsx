"use client";

import EmojiMessage from "@/components/chat/message-type/EmojiMessage";
import ImageMessage from "@/components/chat/message-type/ImageMassage";
import TextMessage from "@/components/chat/message-type/TextMessage";
import { useAuthStore } from "@/stores/useAuthStore";
import { Message } from "@/stores/useChatStore";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const ChatMessage = ({ msg }: { msg: Message }) => {
  const userId = useAuthStore.getState().userId;
  const { type } = msg;
  const [isSender, setIsSender] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (msg.sender === userId) {
      setIsSender(true);
    } else {
      setIsSender(false);
    }
  }, [msg, userId]);

  useEffect(() => {
    if (msg.eventId === highlightId && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [highlightId, msg.eventId]);

  const renderContent = () => {
    switch (type) {
      case "text":
        return <TextMessage msg={msg} isSender={isSender} />;
      case "emoji":
        return <EmojiMessage msg={msg} isSender={isSender} />;
      case "image":
        return <ImageMessage msg={msg} isSender={isSender} />;
      default:
        return <TextMessage msg={msg} isSender={isSender} />;
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}
    >
      <div
        className={`flex flex-col max-w-[90%] w-fit rounded-xl transition ${
          animate ? "flash-highlight" : ""
        }`}
      >
        {renderContent()}
      </div>

      {/* Inject animation CSS trực tiếp */}
      <style jsx>{`
        @keyframes flashHighlight {
          0% {
            box-shadow: 0 0 0px rgba(239, 232, 44, 0);
          }
          30% {
            box-shadow: 0 0 24px rgba(200, 200, 12, 0.9);
          }
          70% {
            box-shadow: 0 0 24px rgba(251, 255, 26, 0.9);
          }
          100% {
            box-shadow: 0 0 0px rgba(104, 116, 11, 0);
          }
        }

        .flash-highlight {
          animation: flashHighlight 1.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
