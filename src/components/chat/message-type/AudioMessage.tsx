"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, CheckCheck, Check } from "lucide-react";
import { Message } from "@/stores/useChatStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import WaveSurfer from "wavesurfer.js";
import { useTheme } from "next-themes";

interface Props {
  msg: Message;
  isSender?: boolean;
}

const AudioMessage: React.FC<Props> = ({ msg, isSender = false }) => {
  if (!msg.audioUrl) return null;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState<number>(msg.audioDuration ?? 0);
  const intervalRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Sync remaining when msg.audioDuration changes
  useEffect(() => {
    setRemaining(msg.audioDuration ?? 0);
  }, [msg.audioDuration]);

  const startCountdown = () => {
    if (intervalRef.current) return;
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      // setIsPlaying(!playing);
    }
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
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      stopCountdown();
    } else {
      audioRef.current.play();
      startCountdown();
    }
    setPlaying((p) => !p);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-[#25D366] justify-end dark:text-white" : "text-[#25D366] dark:text-white"
  );

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: isDarkMode ? "#afa4a4" : "#addd9a",
        progressColor: isDarkMode ? "#FFFFFF" : "#25D366",
        height: 30,
        barWidth: 2,
        responsive: true,
        interact: false,
        cursorWidth: 0,
      });

      wavesurferRef.current.load(msg.audioUrl ?? "");
    }
  }, [msg.audioUrl]);

  return (
    <>
      <div className="bg-[#dcf8c6] dark:bg-[#4567fc] rounded-xl p-2 px-3 max-w-xs flex flex-col shadow-sm w-45">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="rounded-full bg-[#25D366] dark:bg-white p-2 text-white"
          >
            {playing ? (
              <Pause className="dark:text-[#4567fc]" size={20} />
            ) : (
              <Play className="dark:text-[#4567fc]" size={20} />
            )}
          </button>

          <div className="flex-1">
            <div ref={waveformRef} className="w-full" />
            <div className="flex items-center">
              <span className="text-[10px] text-[#25D366] dark:text-white">
                {mm}:{ss}
              </span>
            </div>
            <audio
              ref={audioRef}
              src={msg.audioUrl}
              onEnded={() => {
                setPlaying(false);
                stopCountdown();
                setRemaining(msg.audioDuration ?? 0);
              }}
              className="hidden"
            />
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
    </>
  );
};

export default AudioMessage;
