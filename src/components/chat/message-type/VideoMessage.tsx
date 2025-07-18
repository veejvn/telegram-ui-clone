"use client";

import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { useRef, useState } from "react";
import { FaVolumeMute } from "react-icons/fa";
import { GoUnmute } from "react-icons/go";

const VideoMessage = ({ msg, isSender }: MessagePros) => {
  if (!msg.videoUrl) return;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const formatDuration = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  const textClass = clsx(
    "absolute bottom-1 right-2 text-xs text-xs mt-1",
    isSender
      ? "text-white"
      : "text-zinc-400"
  );
  return (
    <div
      className={clsx(
        "relative max-w-[60%] rounded-2xl overflow-hidden border-2 border-white dark:border-[#4567fc] shadow-md",
        isSender ? "ml-auto" : "mr-auto"
      )}
    >
      <video
        ref={videoRef}
        src={msg.videoUrl}
        muted={muted}
        onLoadedData={() => setLoaded(true)}
        className="w-full h-auto object-cover cursor-pointer"
        onClick={() => videoRef.current?.play()}
        playsInline
        controls={false}
      />

      {/* Overlay thời lượng */}
      {loaded && (
        <div className="absolute top-1 left-2 text-white text-xs font-semibold bg-black/60 px-1 py-[1px] rounded">
          <div className="flex flex-row gap-1">
            {formatDuration(msg?.metadataVideo?.duration || 0)}
            {/* Icon mute/unmute */}
            {loaded && (
              <button
                className="text-white text-xs"
                onClick={() => setMuted(!muted)}
              >
                {muted ? (
                  <FaVolumeMute className="text-white" size={14} />
                ) : (
                  <GoUnmute className="text-white" size={1} />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className={`text-white bg-black/60 px-1 rounded-full ${textClass}`}>
        <div className="flex flex-row gap-1">
          <span className="mt-0.5">{formatMsgTime(msg.time)}</span>
          {isSender &&
            (msg.status === "read" ? (
              <CheckCheck className="mt-0.5" size={14} />
            ) : (
              <Check className="mt-0.5" size={14} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default VideoMessage;
