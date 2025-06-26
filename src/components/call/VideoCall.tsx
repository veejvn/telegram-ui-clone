'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import useCallStore from '@/stores/useCallStore';

interface VideoCallProps {
    contactName: string;
    callState?: string;       // <-- Đã thêm
    callDuration?: number;    // <-- Đã thêm
    onEndCall: () => void;
}

export function VideoCall({
    contactName,
    callState,
    callDuration,
    onEndCall,
}: VideoCallProps) {
    const { localStream, remoteStream, state: storeState, hangup } = useCallStore();

    // Ưu tiên lấy state/duration từ props nếu có
    const state = callState ?? storeState;
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [internalDuration, setInternalDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Attach local stream to PiP video
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream when connected
    useEffect(() => {
        if (state === 'connected' && remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, state]);

    // Control mic
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        }
    }, [micOn, localStream]);

    // Control camera
    useEffect(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach((t) => (t.enabled = cameraOn));
        }
    }, [cameraOn, localStream]);

    // Control speaker
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !speakerOn;
        }
    }, [speakerOn]);

    // Timer
    useEffect(() => {
        let timer: number | undefined;
        if (state === 'connected') {
            timer = window.setInterval(() => setInternalDuration((t) => t + 1), 1000);
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEnd = () => {
        hangup();
        onEndCall();
    };

    return (
        <div className="relative w-full h-screen dark:bg-[#1C1C1E] dark:text-white overflow-hidden">
            {/* Remote video or loading fallback */}
            {state === 'connected' ? (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
            ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xl font-medium">
                    Đang chờ đối phương chấp nhận...
                </div>
            )}

            {/* Local PiP video */}
            <div className="absolute top-4 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
                {!cameraOn && (
                    <div className="absolute inset-0 dark:bg-[#2C2C2E] flex items-center justify-center">
                        <VideoOff className="w-8 h-8 dark:text-gray-400" />
                    </div>
                )}
            </div>

            {/* Call Info */}
            <div className="absolute top-6 left-6 text-left">
                <h2 className="text-2xl font-semibold">{contactName}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#0088CC]" />
                    <span className="text-sm dark:text-gray-300">
                        {{
                            ringing: 'Đang kết nối...',
                            connecting: 'Đang kết nối...',
                            incoming: 'Cuộc gọi đến...',
                            connected: formatDuration(callDuration ?? internalDuration),
                            ended: 'Cuộc gọi đã kết thúc',
                            error: 'Lỗi cuộc gọi',
                            idle: '',
                        }[state]}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-24 inset-x-0 pb-6 pt-20 bg-gradient-to-t dark:from-[#1C1C1E] dark:via-[#1C1C1E]/80 dark:to-transparent">
                <div className="flex justify-center gap-8">
                    {/* Mic */}
                    <ControlButton
                        onClick={() => setMicOn((v) => !v)}
                        active={micOn}
                        icon={micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        label={micOn ? 'Mute' : 'Unmute'}
                    />
                    {/* Camera */}
                    <ControlButton
                        onClick={() => setCameraOn((v) => !v)}
                        active={cameraOn}
                        icon={cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        label={cameraOn ? 'Stop Video' : 'Start Video'}
                    />
                    {/* Speaker */}
                    <ControlButton
                        onClick={() => setSpeakerOn((v) => !v)}
                        active={speakerOn}
                        icon={speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        label={speakerOn ? 'Speaker' : 'Muted'}
                    />
                    {/* End */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handleEnd}
                            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors mb-2"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                        <span className="text-xs dark:text-white/80">End</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 📦 Reusable control button
function ControlButton({
    onClick,
    active,
    icon,
    label,
}: {
    onClick: () => void;
    active: boolean;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onClick}
                className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                    active
                        ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]'
                        : 'bg-red-500/80 hover:bg-red-600/80'
                )}
            >
                {icon}
            </button>
            <span className="text-xs dark:text-white/80">{label}</span>
        </div>
    );
}
