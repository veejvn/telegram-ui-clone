"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, CheckCheck, Check } from "lucide-react";
import { Message } from "@/stores/useChatStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import WaveSurfer from "wavesurfer.js";

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
    isSender ? "text-[#25D366] justify-end" : "text-[#25D366]"
  );

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#BDEACF",
        progressColor: "#25D366", // WhatsApp green
        height: 30,
        barWidth: 2,
        responsive: true,
        interact: false,
        cursorWidth: 0,
      });

      wavesurferRef.current.load(msg.audioUrl ?? "");

      // wavesurferRef.current.on("finish", () => {
      //   setIsPlaying(false);
      // });
    }
  }, [msg.audioUrl]);

  return (
    <>
      {/* <div
        className={`relative flex items-center px-4 py-2 rounded-2xl max-w-xs ${
          isSender ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
        }`}
      >
        <button onClick={togglePlay} className="flex-shrink-0">
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="flex items-center mx-3">
          <span className="ml-1 text-sm text-gray-700">
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
      </div> */}

      <div className="bg-[#dcf8c6] rounded-xl p-2 px-3 max-w-xs flex items-center gap-3 shadow-sm w-45">
        <button
          onClick={togglePlay}
          className="rounded-full bg-[#25D366] p-2 text-white"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="flex-1">
          <div ref={waveformRef} className="w-full" />
          <div className="flex items-center mx-3">
            <span className="text-[10px] text-[#25D366]">
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
      </div>
    </>
  );
};

export default AudioMessage;
