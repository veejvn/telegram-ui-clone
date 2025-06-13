"use client";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { Message } from "@/stores/useChatStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import { CheckCheck } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

const authServie = new MatrixAuthService();

const { userId } = authServie.getCurrentUser();

const ChatMessage = ({ msg }: { msg: Message }) => {
  const { theme } = useTheme();

  const [isSender, setIsSender] = useState(false);
  useEffect(() => {
    if (msg.sender === userId) {
      setIsSender(true);
    } else {
      setIsSender(false);
    }
  }, [msg]);

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-3 py-2 my-1 max-w-[90%] w-fit 
        ${
          theme === "dark"
            ? isSender
              ? "text-white bg-[#6f42c1]"
              : "text-white bg-[#282434]"
            : isSender
            ? "text-black bg-[#DCF8C6]"
            : "text-black bg-white border border-gray-300"
        }
        `}
      >
        <p className="whitespace-pre-wrap break-words leading-snug">
          {msg.text}
        </p>

        <div
          className={`flex items-center gap-1 text-xs justify-end ${
            theme === "dark"
              ? isSender
                ? "text-white"
                : "text-gray-400"
              : isSender
              ? "text-green-500"
              : "text-gray-400"
          }`}
        >
          {formatMsgTime(msg.time)}
          {isSender && <CheckCheck size={14} />}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
