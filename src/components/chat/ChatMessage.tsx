import { CheckCheck } from "lucide-react";
import React from "react";

type ChatMessageProps = {
  index: number;
  text?: string;
  time?: string;
  isSender?: boolean;
};

const ChatMessage = ({
  index,
  text = "Lorem ipsum",
  time,
  isSender = false,
}: ChatMessageProps) => {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-3 py-2 my-1 max-w-[90%] w-fit 
        text-white 
        ${isSender ? "bg-[#6f42c1]" : "bg-[#282434]"}
        `}
      >
        <p className="whitespace-pre-wrap break-words leading-snug">{text}</p>

        <div
          className={`flex items-center gap-1 text-xs
        justify-end ${isSender ? "text-white" : "text-gray-400"}`}
        >
          {time ?? `${index + 1}0:${(index + 1 + index) * 10}`}
          {isSender && <CheckCheck size={14} />}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
