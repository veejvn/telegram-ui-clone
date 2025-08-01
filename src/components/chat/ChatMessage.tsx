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
import { useSelectionStore } from "@/stores/useSelectionStore";
import { Check } from "lucide-react";
import { clsx } from "clsx";

const ChatMessage = ({ msg, roomId }: { msg: Message; roomId: string }) => {
  //console.log("Room Id in ChatMessage: " + roomId)
  const userId = useAuthStore.getState().userId;
  const { type } = msg;
  const isSender = msg.sender === userId;
  const messageRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [animate, setAnimate] = useState(false);

  // Selection store
  const { isSelectionMode, isMessageSelected, toggleMessage } =
    useSelectionStore();

  const isSelected = isMessageSelected(msg.eventId);

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
      className={clsx(
        "flex my-2",
        // Khi ở selection mode, luôn justify-start để checkbox ở bên trái
        isSelectionMode
          ? "justify-start"
          : isSender
          ? "justify-end"
          : "justify-start"
      )}
    >
      {/* Selection checkbox - chỉ hiển thị khi ở selection mode */}
      {isSelectionMode && (
        <div
          className={clsx(
            "flex items-center mr-3 my-auto",
            // Làm mờ checkbox nếu tin nhắn chưa được chọn
            !isSelected && "opacity-50"
          )}
          onClick={() => toggleMessage(msg.eventId)}
        >
          <div
            className={clsx(
              "size-[13px] rounded-full border-2 flex items-center justify-center transition-all",
              isSelected
                ? "bg-[#026AE0] border-[#026AE0]"
                : "border-[#6B7271] border-[0.5px]"
            )}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      <div
        className={clsx(
          "flex flex-col max-w-[90%] w-fit rounded-xl transition",
          animate && "flash-background",
          // Khi ở selection mode, điều chỉnh layout cho phù hợp
          isSelectionMode && isSender && "ml-auto"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
