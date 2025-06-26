import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

const TextMessage = ({ msg, isSender, animate }: MessagePros) => {
  const textClass = clsx(
    "rounded-lg px-3 py-2",
    isSender
      ? "text-black bg-[#DCF8C6] dark:text-white dark:bg-[#6f42c1]"
      : "text-black bg-white border border-gray-300 dark:text-white dark:bg-[#282434]",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender
      ? "text-green-500 justify-end dark:text-white"
      : "text-gray-400 dark:text-gray-400"
  );

  return (
    <div className={textClass}>
      <p className="whitespace-pre-wrap break-words leading-snug">{msg.text}</p>
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
  );
};

export default TextMessage;
