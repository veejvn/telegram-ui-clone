"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, CheckCheck, Check } from "lucide-react";
import { Message } from "@/stores/useChatStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import WaveSurfer from "wavesurfer.js";
import { useTheme } from "next-themes";
import { FaPause, FaPlay } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Props {
  msg: Message;
  isSender?: boolean;
}

const AudioMessage: React.FC<Props> = ({ msg, isSender = false }) => {
  if (!msg.audioUrl) return null;

  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState<number>(msg.audioDuration ?? 0);
  const intervalRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Sync remaining when msg.audioDuration changes
  useEffect(() => {
    setRemaining(msg.audioDuration ?? 0);
  }, [msg.audioDuration]);

  const startCountdown = () => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!wavesurferRef.current) return;

    if (playing) {
      wavesurferRef.current.pause();
      stopCountdown();
    } else {
      wavesurferRef.current.play();
      startCountdown();
    }
    setPlaying((p) => !p);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const textClass = clsx(
    "flex items-center justify-end gap-1 text-xs",
    isSender
      ? "text-[#79c071]  dark:text-white"
      : "text-zinc-400 dark:text-white"
  );

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const waveColor = isSender ? (isDarkMode ? "#afa4a4" : "#96d78e") : "#e7edf3";

  const progressColor = isSender
    ? isDarkMode
      ? "#FFFFFF"
      : "#79c071"
    : "#72b6e5";

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: waveColor,
        progressColor: progressColor,
        height: 30,
        barWidth: 2,
        responsive: true,
        interact: false,
        cursorWidth: 0,
      });

      wavesurferRef.current.load(msg.audioUrl ?? "");

      // Add event listeners
      wavesurferRef.current.on("finish", () => {
        setPlaying(false);
        stopCountdown();
        setRemaining(msg.audioDuration ?? 0);
      });

      wavesurferRef.current.on("pause", () => {
        setPlaying(false);
        stopCountdown();
      });

      wavesurferRef.current.on("play", () => {
        setPlaying(true);
        startCountdown();
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [msg.audioUrl]);

  return (
    <div
      className={cn(
        `bg-[#dcf8c6] dark:bg-[#4567fc] rounded-xl p-2 px-3 max-w-xs flex flex-col shadow-sm w-45 select-none ${
          !isSender && "bg-white dark:bg-[#222e3a]"
        }`
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={cn(
            `rounded-full bg-[#79c071] dark:bg-white flex justify-center items-center size-10 p-2 text-white ${
              !isSender && "bg-[#74b4ec] dark:bg-[#74b4ec]"
            }`
          )}
        >
          {playing ? (
            <FaPause
              className={`${
                isSender ? "dark:text-[#4567fc]" : "dark:text-white"
              }`}
              size={16}
            />
          ) : (
            <FaPlay
              className={`${
                isSender ? "dark:text-[#4567fc]" : "dark:text-white"
              }`}
              size={16}
            />
          )}
        </button>

        <div className="flex-1">
          <div ref={waveformRef} className="w-full" />
          <div className="flex items-center">
            <span
              className={cn(
                `text-xs text-[#79c071] dark:text-white ${
                  !isSender && "text-[#74b4ec]"
                }`
              )}
            >
              {mm}:{ss}
            </span>
          </div>
        </div>
      </div>
      <div className={`flex justify-between ${textClass}`}>
        <span className="flex items-center gap-1">
          {formatMsgTime(msg.time)}
          {isSender &&
            (msg.status === "read" ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            ))}
        </span>
      </div>
    </div>
  );
};

export default AudioMessage;
