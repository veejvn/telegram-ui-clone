// src/components/call/ActiveCall.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import useCallStore from '@/stores/useCallStore';

interface ActiveCallProps {
    onEnd: () => void;
}

export default function ActiveCall({ onEnd }: ActiveCallProps) {
    const { localStream, remoteStream, hangup } = useCallStore();
    const localRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState(0);

    // Attach streams to video elements
    useEffect(() => {
        if (localRef.current && localStream) {
            localRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Call duration timer
    useEffect(() => {
        const timer = setInterval(() => setDuration((d) => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEnd = () => {
        hangup();
        onEnd();
    };

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            {/* Remote video fullscreen */}
            <video
                ref={remoteRef}
                autoPlay
                playsInline
                muted={false}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Local video PiP */}
            <div className="absolute bottom-4 right-4 w-32 aspect-square rounded overflow-hidden border border-white/20">
                <video
                    ref={localRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Controls */}
            <div className="absolute top-4 left-4 text-white">
                <p>Thời gian: {formatTime(duration)}</p>
            </div>
            <button
                onClick={handleEnd}
                className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Kết thúc
            </button>
        </div>
    );
}
