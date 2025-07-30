"use client";

import EmojiMessage from "@/components/chat/message-type/EmojiMessage";
import ImageMessage from "@/components/chat/message-type/ImageMassage";
import TextMessage from "@/components/chat/message-type/TextMessage";
import AudioMessage from "@/components/chat/message-type/AudioMessage";
import { useAuthStore } from "@/stores/useAuthStore";
import { Message } from "@/stores/useChatStore";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ForwardTextMessage from "./message-type/ForwardTextMessage";
import { LocationMessage } from "@/components/chat/message-type/LocationMessage";
import FileMessage from "@/components/chat/message-type/FileMessage";
import VideoMessage from "@/components/chat/message-type/VideoMessage";
import StickerMessage from "@/components/chat/message-type/StickerMessage";

const ChatMessage = ({ msg, roomId }: { msg: Message; roomId: string }) => {
  //console.log("Room Id in ChatMessage: " + roomId)
  const userId = useAuthStore.getState().userId;
  const { type } = msg;
  const isSender = msg.sender === userId;
  const messageRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [animate, setAnimate] = useState(false);

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

  const handleForwardMsg = () => {
    //  Nếu chưa có flag, thử parse JSON
    if ((type === "text" || type === "emoji") && typeof msg.text === "string") {
      try {
        const parsed = JSON.parse(msg.text);
        if (parsed.forward && parsed.text && parsed.originalSender) {
          return {
            text: parsed.text,
            originalSenderId: parsed.originalSenderId,
            originalSender: parsed.originalSender,
          };
        }
      } catch (e) {
        return null;
      }
    }

    return null;
  };

  const forwardInfo = handleForwardMsg();

  const renderContent = () => {
    switch (type) {
      case "text":
        return forwardInfo ? (
          <ForwardTextMessage
            msg={msg}
            isSender={isSender}
            animate={animate}
            forwardMessage={forwardInfo}
          />
        ) : (
          <TextMessage
            msg={msg}
            isSender={isSender}
            animate={animate}
            roomId={roomId}
          />
        );
      case "emoji":
        return <EmojiMessage msg={msg} isSender={isSender} />;
      case "audio":
        return <AudioMessage msg={msg} isSender={isSender} />;
      case "image":
        return <ImageMessage msg={msg} isSender={isSender} />;
      case "location":
        return <LocationMessage msg={msg} isSender={isSender} />;
      case "file":
        return <FileMessage msg={msg} isSender={isSender} />;
      case "video":
        return <VideoMessage msg={msg} isSender={isSender} />;
      case "sticker":
        return <StickerMessage msg={msg} isSender={isSender} />;
      default:
        //console.warn("⚠️ Unknown type in message:", msg);
        return <TextMessage msg={msg} isSender={isSender} roomId={roomId} />;
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}
    >
      <div
        className={`flex flex-col max-w-[90%] w-fit rounded-xl transition ${
          animate ? "flash-background" : ""
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
