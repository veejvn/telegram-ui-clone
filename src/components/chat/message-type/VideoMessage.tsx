"use client";

import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaVolumeMute } from "react-icons/fa";
import { FaPause, FaPlay } from "react-icons/fa6";
import { GoUnmute } from "react-icons/go";

const VideoMessage = ({ msg, isSender }: MessagePros) => {
  if (!msg.videoUrl) return;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { width, height, duration } = msg.metadataVideo || {};
  const aspectRatio = width && height ? width / height : 16 / 9;
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseBtn, setShowPauseBtn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration || 0);
  const intervalRef = useRef<number | null>(null);

  const containerStyle = {
    aspectRatio: `${aspectRatio}`,
    width: width ? `${Math.min(width, 320)}px` : "320px", // Giới hạn max width
    minWidth: "200px",
    background: "#000",
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setMuted(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setMuted(false);
      setShowPauseBtn(true);
      setTimeout(() => setShowPauseBtn(false), 2000);
    }
  };

  const formatDuration = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const updateTime = () => {
      setRemainingTime(
        Math.max(0, (duration || 0) - Math.floor(video.currentTime * 1000))
      );
    };

    if (isPlaying) {
      updateTime(); // cập nhật ngay khi play
      intervalRef.current = setInterval(updateTime, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Clear interval khi unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    setRemainingTime(duration || 0);
  }, [msg.videoUrl, duration]);

  const textClass = clsx(
    "absolute bottom-1 right-2 text-xs text-xs mt-1",
    isSender ? "text-white" : "text-zinc-400"
  );
  return (
    <div
      className={clsx(
        "relative max-w-[60%] rounded-2xl overflow-hidden border-2 border-white dark:border-[#4567fc] shadow-md",
        isSender ? "ml-auto" : "mr-auto"
      )}
      style={containerStyle}
    >
      <video
        ref={videoRef}
        src={msg.videoUrl}
        muted={muted}
        onLoadedData={() => setLoaded(true)}
        className="w-full h-full object-cover cursor-pointer"
        onClick={() => videoRef.current?.play()}
        playsInline
        controls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setRemainingTime(duration || 0);
          setMuted(true);
        }}
      />

      {/* Overlay thời lượng */}
      {loaded && (
        <div className="absolute top-1 left-2 text-white text-xs font-semibold bg-black/60 px-1 py-[1px] rounded">
          <div className="flex flex-row gap-1">
            {formatDuration(remainingTime)}
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

      {loaded && (
        <>
          {/* Overlay button luôn luôn phủ lên video để nhận sự kiện click */}
          <button
            className="absolute inset-0 flex items-center justify-center z-10 focus:outline-none"
            onClick={handlePlayPause}
            tabIndex={-1}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{ background: "transparent" }}
          >
            {/* Hiện icon Play khi chưa phát, hiện icon Pause khi vừa bấm Play, còn lại thì không hiện gì */}
            {!isPlaying ? (
              <div className="flex justify-center items-center rounded-full p-3 bg-black/40">
                <FaPlay className="text-white" />
              </div>
            ) : showPauseBtn ? (
              <div className="flex justify-center items-center rounded-full p-3 bg-black/40">
                <FaPause className="text-white" />
              </div>
            ) : null}
          </button>
        </>
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
