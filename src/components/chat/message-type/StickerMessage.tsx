"use client";

import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { useState } from "react";

const StickerMessage = ({ msg, isSender }: MessagePros) => {
  const stickerUrl = msg.text;

  const textClass = clsx("absolute bottom-1 text-xs right-2 text-white");

  return (
    <div className="py-2">
      <div
        className={clsx(
          "relative overflow-hidden rounded-3xl flex items-center justify-center",
          isSender ? "ml-auto" : "mr-auto"
        )}
      >
        {msg.isStickerAnimation ? (
          <video
            src={stickerUrl}
            autoPlay
            loop
            muted
            playsInline
            className="rounded-xl size-50 object-cover transition-opacity duration-300"
          />
        ) : (
          <img
            src={stickerUrl}
            alt="sticker"
            className={`rounded-xl object-cover size-50 transition-opacity duration-300`}
          />
        )}

        <div className={textClass}>
          <p className="bg-zinc-500 overflow-hidden items-center px-2 py-0.5 mt-2 flex gap-1 rounded-full select-none">
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

export default StickerMessage;
