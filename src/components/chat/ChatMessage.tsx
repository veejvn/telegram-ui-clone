"use client";
import EmojiMessage from "@/components/chat/message-type/EmojiMessage";
import ImageMessage from "@/components/chat/message-type/ImageMassage";
import TextMessage from "@/components/chat/message-type/TextMessage";
import { useAuthStore } from "@/stores/useAuthStore";
import { Message } from "@/stores/useChatStore";
import React, { useEffect, useState } from "react";

const ChatMessage = ({ msg }: { msg: Message }) => {
  const userId = useAuthStore.getState().userId;
  const { type } = msg;
  const isSender = msg.sender === userId;
  // const [isSender, setIsSender] = useState(false);

  // useEffect(() => {
  //   if (msg.sender === userId) {
  //     setIsSender(true);
  //   } else {
  //     setIsSender(false);
  //   }
  // }, [msg]);

  const renderContent = () => {
    switch (type) {
      case "text":
        return <TextMessage msg={msg} isSender={isSender} />;
      case "emoji":
        return <EmojiMessage msg={msg} isSender={isSender} />;
      case "image":
        return <ImageMessage msg={msg} isSender={isSender} />;
      default:
        console.warn("⚠️ Unknown type in message:", msg);
        return <TextMessage msg={msg} isSender={isSender} />;
    }
  };

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}>
      <div className="flex flex-col max-w-[90%] w-fit">{renderContent()}</div>
    </div>
  );
};

export default ChatMessage;
