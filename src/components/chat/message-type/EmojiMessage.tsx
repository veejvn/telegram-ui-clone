import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

const EmojiMessage = ({ msg, isSender }: MessagePros) => {
  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-white justify-end" : "text-white"
  );

  return (
    <div className={`rounded-lg py-2`}>
      <p
        className={clsx(
          "whitespace-pre-wrap break-words leading-snug text-end text-7xl",
          isSender ? "text-right" : "text-left"
        )}
      >
        {msg.text}
      </p>
      <div className={textClass}>
        <p
          className="backdrop-blur-sm backdrop-brightness-70 
                    overflow-hidden items-center
                    px-2 py-0.5 mt-3.5 flex gap-1 rounded-full"
        >
          {formatMsgTime(msg.time)}
          {isSender &&
            (msg.status === "read" ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            ))}
        </p>
      </div>
    </div>
  );
};

export default EmojiMessage;
