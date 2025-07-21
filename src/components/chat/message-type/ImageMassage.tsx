"use client";

import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import { useState } from "react";

const ImageMessage = ({ msg, isSender }: MessagePros) => {
  //if (!msg.imageUrl) return null;
  const [isLoaded, setIsLoaded] = useState(false);
  const { width, height } = msg.imageInfo || {};
  //console.log("Nội dung: " + msg.text + ", Rộng: " + width + ", Cao: " + height);
  const maxW = 320;
  const maxH = 320;
  let boxW = maxW,
    boxH = maxH;
  if (width && height) {
    const ratio = width / height;
    if (ratio > 1) {
      // Ảnh ngang
      boxW = maxW;
      boxH = Math.round(maxW / ratio);
    } else {
      // Ảnh dọc hoặc vuông
      boxH = maxH;
      boxW = Math.round(maxH * ratio);
    }
  }
  const textClass = clsx(
    "absolute bottom-1 text-xs right-2",
    isSender ? "text-white" : "text-zinc-400"
  );

  //console.log(msg)

  return (
    <div className={`rounded-lg py-2`}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-xl  flex items-center justify-center bg-gray-200 dark:bg-gray-700",
          isSender ? "ml-auto" : "mr-auto"
        )}
        style={{
          width: boxW + "px",
          height: boxH + "px",
          maxWidth: maxW + "px",
          maxHeight: maxH + "px",
        }}
      >
        {msg.imageUrl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10 bg-gray-200 dark:bg-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Đang tải ảnh...</span>
              </div>
            )}
            <img
              src={msg.imageUrl}
              alt={msg.text}
              className={`rounded-xl object-contain w-full h-full transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ minHeight: "60px" }}
              onLoad={() => setIsLoaded(true)}
            />
          </>
        ) : (
          // Hiển thị loading khi chưa có imageUrl
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
            <span className="text-xs text-gray-500">Đang tải ảnh...</span>
          </div>
        )}

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
