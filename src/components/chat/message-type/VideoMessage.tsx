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
  //if (!msg.videoUrl) return;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { width, height, duration } = msg.videoInfo || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseBtn, setShowPauseBtn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration || 0);
  const intervalRef = useRef<number | null>(null);

  const maxW = 320;
  const maxH = 320;
  let boxW = maxW, boxH = maxH;
  if (width && height) {
    const ratio = width / height;
    if (ratio > 1) {
      // Video ngang
      boxW = maxW;
      boxH = Math.round(maxW / ratio);
    } else {
      // Video dọc hoặc vuông
      boxH = maxH;
      boxW = Math.round(maxH * ratio);
    }
  }

  const containerStyle = {
    width: boxW + "px",
    height: boxH + "px",
    maxWidth: maxW + "px",
    maxHeight: maxH + "px",
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
    "absolute bottom-1 right-2 text-xs text-xs mt-1 text-white"
  );

  return (
    <div
      className={clsx(
        "relative rounded-2xl overflow-hidden border-2 border-white dark:border-[#4567fc] shadow-md",
        isSender ? "ml-auto" : "mr-auto"
      )}
      style={containerStyle}
    >
      {/* Nếu chưa có videoUrl, hiện loading/placeholder */}
      {!msg.videoUrl ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
          <span className="text-xs text-gray-200">Đang tải video...</span>
        </div>
      ) : (
        <>
          {/* Overlay loading khi video chưa load xong */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10 bg-black/60">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
              <span className="text-xs text-gray-200">Đang tải video...</span>
            </div>
          )}
          <video
            ref={videoRef}
            src={msg.videoUrl}
            muted={muted}
            onLoadedData={() => setLoaded(true)}
            className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
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
        </>
      )}

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
