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
  const isDarkMode = false; // Force light mode as requested

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

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Colors to match the design in the image
  const waveColor = "#e5e6e6"; // Light gray for inactive bars
  const progressColor = "#007aff"; // Blue for active/progress bars

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: waveColor,
        progressColor: progressColor,
        height: 24,
        barWidth: 3,
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
    <div className="flex relative items-end">
      {/* Check icon cho tin gửi - đặt bên trái */}
      {isSender && (
        <div className="flex items-end mr-2 my-auto">
          <span
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${
              msg.status === "read" ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Check className="w-2.5 h-2.5 text-white" />
          </span>
        </div>
      )}

      <div className="bg-[#808080]/30 rounded-2xl p-3 w-45 max-w-xs flex flex-col shadow-sm select-none">
        {/* Transfer info */}
        {/* <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">A</span>
          </div>
          <span className="text-sm text-gray-600">Transfer from Andrew</span>
        </div> */}

        {/* Audio player */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="rounded-full bg-[#000088] flex justify-center items-center w-10 h-10 text-white hover:bg-blue-600 transition-colors"
          >
            {playing ? (
              <FaPause size={14} />
            ) : (
              <FaPlay size={14} className="ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <div ref={waveformRef} className="w-full mb-1" />
            <div className="flex items-center">
              <span className="text-[10px] text-[#6B7271]">
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>

        {/* Time at bottom */}
        <div className="flex justify-end mt-1">
          <div className="flex items-center gap-1 text-[10px] text-[#6B7271]">
            <span>{formatMsgTime(msg.time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
