'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import useCallStore from '@/stores/useCallStore';

interface VideoCallProps {
    contactName: string;
    callState?: string;
    callDuration?: number;
    onEndCall: () => void;
}

export function VideoCall({
    contactName,
    callState,
    callDuration,
    onEndCall,
}: VideoCallProps) {
    const {
        localStream,
        remoteStream,
        micOn,
        toggleMic,
        toggleCamera,
        upgradeToVideo,
        state: storeState,
        hangup
    } = useCallStore();

    const state = callState ?? storeState;
    const prevState = useRef(state);
    useEffect(() => {
        // chỉ fire onEndCall khi có transition từ active -> ended/error
        const wasActive = ['incoming', 'ringing', 'connecting', 'connected'].includes(prevState.current);
        const isFinal = state === 'ended' || state === 'error';
        if (wasActive && isFinal) {
            onEndCall();
        }
        prevState.current = state;
    }, [state, onEndCall]);
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [internalDuration, setInternalDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [lastLocalTrackId, setLastLocalTrackId] = useState<string | undefined>();

    // Thêm trạng thái preview
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack && videoTrack.id !== lastLocalTrackId) {
                localVideoRef.current.srcObject = localStream;
                setLastLocalTrackId(videoTrack.id);
            }
        }
    }, [localStream]);

    // Attach remote video
    // Dưới useEffect gán remoteStream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            // Khi remote bật lại track, track.onunmute sẽ fire
            remoteStream.getVideoTracks().forEach(track => {
                track.onunmute = () => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        remoteVideoRef.current.play().catch(() => { });
                    }
                };
            });
        }
    }, [remoteStream]);

    // Toggle speaker
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

    // Khi bắt đầu gọi video, show preview trước
    useEffect(() => {
        if (state === 'calling' && cameraOn) {
            setShowPreview(true);
        } else {
            setShowPreview(false);
        }
    }, [state, cameraOn]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEnd = () => {
        hangup();
        onEndCall();
    };

    // Khi showPreview, có thể return null hoặc logic khác nếu cần
    if (showPreview) {
        return null;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Remote video background */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1, background: '#000' }}
            />

            {/* Local PiP */}
            {cameraOn && (
                <div className="absolute bottom-32 right-4 w-28 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-lg z-20 bg-black/40">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Thông báo khi tắt camera */}
            {!cameraOn && (
                <div className="absolute bottom-36 right-6 z-30 bg-black/70 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <VideoOff className="w-5 h-5 text-white/80" />
                    <span className="text-white text-sm font-medium">Your camera is off</span>
                </div>
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-6 z-30">
                <div className="flex items-center justify-between w-full px-4">
                    <button className="flex items-center gap-1 text-white/90 text-lg" onClick={handleEnd}>
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <div className="bg-blue-500 text-white rounded-full px-3 py-0.5 text-xs font-bold">TELEGRAM</div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white/80" />
                    </div>
                </div>
                <div className="mt-2 text-2xl">🧱🐷🐱🚂</div>
                <div className="mt-2 text-center">
                    <div className="text-white text-2xl font-semibold drop-shadow">{contactName}</div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-white/80 text-base">📶</span>
                        <span className="text-white/80 text-lg font-mono">{formatDuration(callDuration ?? internalDuration)}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 w-full flex items-center justify-center gap-6 z-30">
                {/* Flip camera */}
                <div className="flex flex-col items-center">
                    <button
                        className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur"
                        onClick={() => {/* TODO: implement flip camera */ }}
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l2 2 2-2m-2 2V7m-6 0l-2-2-2 2m2-2v12" /></svg>
                    </button>
                    <span className="text-xs text-white/80">flip</span>
                </div>
                {/* Video */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${cameraOn ? 'bg-white/20' : 'bg-red-500/80'}`}
                        onClick={() => {
                            if (!cameraOn) {
                                upgradeToVideo();
                            } else {
                                toggleCamera(false);
                            }
                            setCameraOn(!cameraOn);
                        }}
                    >
                        {cameraOn ? <Video className="w-8 h-8 text-white" /> : <VideoOff className="w-8 h-8 text-white" />}
                    </button>
                    <span className="text-xs text-white/80">video</span>
                </div>
                {/* Mute */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${micOn ? 'bg-white/20' : 'bg-red-500/80'}`}
                        onClick={() => toggleMic(!micOn)}
                    >
                        {micOn ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
                    </button>
                    <span className="text-xs text-white/80">mute</span>
                </div>
                {/* End */}
                <div className="flex flex-col items-center">
                    <button
                        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-1"
                        onClick={handleEnd}
                    >
                        <PhoneOff className="w-8 h-8 text-white" />
                    </button>
                    <span className="text-xs text-white/80">end</span>
                </div>
            </div>
        </div>
    );
}

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
                        ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E] border-white'
                        : 'bg-gray-500 dark:bg-gray-700 border-white'
                )}
            >
                <span className={cn(
                    "w-6 h-6",
                    active ? "text-white" : "text-white opacity-60"
                )}>
                    {icon}
                </span>
            </button>
            <span className={cn(
                "text-xs",
                active
                    ? "text-white"
                    : "text-white opacity-60"
            )}>{label}</span>
        </div>
    );
}
