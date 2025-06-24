import Image from "next/image";
import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

const ImageMessage = ({ msg, isSender }: MessagePros) => {
  if (!msg.imageUrl) return null;

  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-white justify-end" : "text-white"
  );

  console.log(msg)

  return (
    <div className={`rounded-lg py-2`}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-xl",
          isSender ? "ml-auto" : "mr-auto"
        )}
      >
        <img src={msg.imageUrl} alt={msg.text} className="rounded-xl object-cover max-h-[320px]"/>
      </div>

      <div className={textClass}>
        <p
          className="backdrop-blur-sm backdrop-brightness-70 
          overflow-hidden items-center
          px-2 py-0.5 mt-2 flex gap-1 rounded-full"
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

export default ImageMessage;
