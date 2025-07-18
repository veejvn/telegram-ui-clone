import Image from "next/image";
import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

const ImageMessage = ({ msg, isSender }: MessagePros) => {
  if (!msg.imageUrl) return null;

  const textClass = clsx(
    "absolute bottom-1 text-xs right-2",
    isSender ? "text-white" : "text-zinc-400"
  );

  //console.log(msg)

  return (
    <div className={`rounded-lg py-2`}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-xl",
          isSender ? "ml-auto" : "mr-auto"
        )}
      >
        <img
          src={msg.imageUrl}
          alt={msg.text}
          className="rounded-xl object-cover max-h-[320px]"
        />

        <div className={textClass}>
          <p className="backdrop-blur-sm backdrop-brightness-70 overflow-hidden items-center px-2 py-0.5 mt-2 flex gap-1 rounded-full select-none">
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
    </div>
  );
};

export default ImageMessage;
