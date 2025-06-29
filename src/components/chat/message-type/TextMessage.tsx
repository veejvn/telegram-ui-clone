import React from "react";
import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import { useTheme } from "next-themes";
import { BubbleTail } from "./BubbleTail";

// 💬 Main TextMessage
const TextMessage = ({ msg, isSender, animate }: MessagePros) => {
  const theme = useTheme();
  const textClass = clsx(
    "rounded-2xl px-4 py-1.5",
    isSender
      ? "text-black bg-[#DCF8C6] dark:text-white dark:bg-[#6f42c1] rounded-br-none"
      : "text-black bg-white dark:text-white dark:bg-[#282434] rounded-bl-none",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex items-center gap-1 text-xs mt-1",
    isSender
      ? "text-green-500 justify-end dark:text-white"
      : "text-gray-400 dark:text-gray-400"
  );

  return (
    <div
      className={clsx(
        "flex items-end", // Đảm bảo tail căn đáy với bubble
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {/* 🡐 Tail cho tin nhận */}
      {!isSender && (
        <BubbleTail
          isSender={false}
          fillColor={theme.theme === "dark" ? "#282434" : "#FFFFFF"}
        />
      )}

      {/* 💬 Nội dung tin nhắn */}
      <div className="flex flex-col  ">
        <div className={textClass}>
          <p className={"whitespace-pre-wrap break-words leading-snug"}>
            {msg.text}
          </p>
          <div className={timeClass}>
            {formatMsgTime(msg.time)}
            {isSender &&
              (msg.status === "read" ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              ))}
          </div>
        </div>
      </div>

      {/* 🡒 Tail cho tin gửi */}
      {isSender && (
        <BubbleTail
          isSender={true}
          fillColor={theme.theme === "dark" ? "#6f42c1" : "#DCF8C6"}
        />
      )}
    </div>
  );
};

export default TextMessage;
