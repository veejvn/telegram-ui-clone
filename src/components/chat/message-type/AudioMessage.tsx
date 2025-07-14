"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Message } from "@/stores/useChatStore";

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
        intervalRef.current = window.setInterval(() => {
            setRemaining(r => {
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
        setPlaying(p => !p);
    };

    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");

    return (
        <div
            className={`relative flex items-center px-4 py-2 rounded-2xl max-w-xs ${isSender ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}
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
    );
};

export default AudioMessage;
