'use client';

import { useState, useEffect, useRef } from 'react';
import {
    User,
    Mic,
    MicOff,
    PhoneOff,
    Volume2,
    VolumeX,
    Video,
    ChevronLeft,
    Lock,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';
import { getHeaderStyleWithStatusBar } from '@/utils/getHeaderStyleWithStatusBar';

interface VoiceCallProps {
    contactName: string;
    contactAvatar?: string;
    callState?: string;
    callDuration?: number;
    onEndCall: () => void;
    onSwitchToVideo?: () => Promise<void> | void;
}

export function VoiceCall({
    contactName,
    callState,
    callDuration,
    onEndCall,
}: VoiceCallProps) {
    const {
        remoteStream,
        micOn,
        toggleMic,
        state: storeState,
        hangup,
        upgradeToVideo,
    } = useCallStore();

    const state = callState ?? storeState;

    // Giữ previous state để detect transition
    const prevStateRef = useRef<string>(state);
    // Flag để ensure chỉ schedule 1 lần
    const notifiedRef = useRef<boolean>(false);
    // Để clear timeout khi unmount
    const timeoutRef = useRef<number | null>(null);

    // UI state
    const [showEndNotification, setShowEndNotification] = useState<boolean>(false);
    const [finalCallDuration, setFinalCallDuration] = useState<number>(0);
    const [internalCallDuration, setInternalCallDuration] = useState<number>(0);

    // --- 1) Cleanup timeout chỉ trên unmount ---
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // --- 2) Khi state chuyển từ active -> ended/error, schedule notification 1 lần ---
    useEffect(() => {
        const wasActive = ['incoming', 'ringing', 'connecting', 'connected'].includes(
            prevStateRef.current
        );
        const isFinal = state === 'ended' || state === 'error';

        if (wasActive && isFinal && !notifiedRef.current) {
            notifiedRef.current = true;
            // Chọn lấy duration từ prop hoặc từ internal count
            const duration = callDuration ?? internalCallDuration;
            setFinalCallDuration(duration);

            setShowEndNotification(true);

            timeoutRef.current = window.setTimeout(() => {
                setShowEndNotification(false);
                onEndCall();
            }, 10_000);
        }

        prevStateRef.current = state;
    }, [state, callDuration, internalCallDuration, onEndCall]);

    // Gán stream vào audio element
    const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.muted = !isSpeakerOn;
        }
    }, [remoteStream, isSpeakerOn]);

    // Đếm thời gian khi connected
    useEffect(() => {
        let timer: number;
        if (state === 'connected') {
            timer = window.setInterval(() => {
                setInternalCallDuration((t) => t + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Handlers
    const handleEnd = () => {
        hangup();
        // onEndCall sẽ do timeout xử lý
    };
    const handleCloseEndNotification = () => {
        setShowEndNotification(false);
        onEndCall();
    };

    const router = useRouter();
    const params = useSearchParams();
    const handleSwitchToVideo = async () => {
        await upgradeToVideo();
        const calleeId = params.get('calleeId');
        const contact = params.get('contact') || contactName;
        router.replace(
            `/call/video?calleeId=${calleeId}&contact=${encodeURIComponent(
                contact
            )}`
        );
    };

    const handleToggleMic = () => {
        toggleMic(!micOn);
    };

    // Speaker/Earpiece cho mobile
    const [audioOutput, setAudioOutput] = useState<'speaker' | 'earpiece'>(
        'speaker'
    );
    const isMobile =
        typeof window !== 'undefined' &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleToggleSpeaker = async () => {
        if (audioRef.current && 'setSinkId' in audioRef.current && isMobile) {
            const next = audioOutput === 'speaker' ? 'earpiece' : 'speaker';
            try {
                await (audioRef.current as any).setSinkId(
                    next === 'speaker' ? 'speaker' : 'default'
                );
                setAudioOutput(next);
            } catch (err) {
                alert('Không thể chuyển loa: ' + (err instanceof Error ? err.message : err));
            }
        } else if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsSpeakerOn(!audioRef.current.muted);
        }
    };
    const headerStyle = getHeaderStyleWithStatusBar();

    const isRinging = ['ringing', 'connecting', 'incoming'].includes(state);

    return (
        <div
            className="relative flex flex-col items-center justify-between min-h-screen w-full"
            style={{
                background: isRinging || showEndNotification
                    ? 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)'
                    : 'linear-gradient(160deg, #6fb0d2 0%, #a3e4a0 100%)',

            }}
        >
            {/* Header */}
            <header
                style={headerStyle}
                className="sticky top-0 z-10 w-full bg-transparent"
            >
                <div className="flex items-center justify-between px-4 pt-4">
                    <button
                        className="flex items-center gap-1 text-white/90 text-lg"
                        onClick={showEndNotification ? handleCloseEndNotification : undefined}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <div className="bg-blue-500 text-white rounded-full px-3 py-0.5 text-xs font-bold">
                        TELEGRAM
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/80" />
                    </div>
                </div>
            </header>

            {/* Emoji & Encryption */}
            <div className="mt-4 flex flex-col items-center">
                <div className="text-3xl">🏦💵🚜🙀</div>
                <div className="mt-2 bg-white/20 rounded-xl px-4 py-1 text-white text-sm flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Encryption key of this call
                </div>
            </div>

            {/* Avatar with Pulse */}
            <div className="flex flex-col items-center mt-12">
                <div className="relative w-40 h-40">
                    {!showEndNotification && <div className="pulse-ring"></div>}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 border-4 border-white/30 flex items-center justify-center z-10">
                        <span className="text-6xl text-white font-bold">
                            {contactName?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="text-white text-2xl font-semibold">
                        {contactName}
                    </div>
                    {showEndNotification ? (
                        <div className="flex flex-col items-center gap-2 mt-1">
                            <div className="text-white/90 text-lg font-normal tracking-wide">
                                Call ended
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-white/80 text-sm">📶</span>
                                <span className="text-white/80 text-lg font-mono">
                                    {formatDuration(finalCallDuration)}
                                </span>
                            </div>
                            <button
                                className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full px-6 py-2 text-white text-sm font-medium transition-colors"
                                onClick={handleCloseEndNotification}
                            >
                                Close
                            </button>
                        </div>
                    ) : isRinging ? (
                        <div className="text-white/90 text-lg mt-1 font-normal tracking-wide">
                            Requesting ...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-white/80 text-sm">📶</span>
                            <span className="text-white/80 text-lg font-mono">
                                {formatDuration(callDuration ?? internalCallDuration)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-12 mt-auto">
                {/* Speaker/Earpiece */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur ${isRinging || showEndNotification ? 'opacity-60' : ''
                            }`}
                        onClick={handleToggleSpeaker}
                        disabled={isRinging || showEndNotification}
                    >
                        {isMobile ? (
                            audioOutput === 'speaker' ? (
                                <Volume2 className="w-8 h-8 text-white" />
                            ) : (
                                <VolumeX className="w-8 h-8 text-white/60" />
                            )
                        ) : isSpeakerOn ? (
                            <Volume2 className="w-8 h-8 text-white" />
                        ) : (
                            <VolumeX className="w-8 h-8 text-white/60" />
                        )}
                    </button>
                    <span className="text-xs text-white/80">
                        {isMobile
                            ? audioOutput === 'speaker'
                                ? 'loa ngoài'
                                : 'loa trong'
                            : isSpeakerOn
                                ? 'bật tiếng'
                                : 'tắt tiếng'}
                    </span>
                </div>

                {/* (Video upgrade button, tạm ẩn) */}
                {/*
        <div className="flex flex-col items-center">
          <button
            className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur ${
              isRinging ? 'opacity-60' : ''
            }`}
            onClick={handleSwitchToVideo}
            disabled={isRinging}
          >
            <Video className="w-8 h-8 text-white" />
          </button>
          <span className="text-xs text-white/80">video</span>
        </div>
        */}

                {/* Mute */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${micOn ? 'bg-white/20' : 'bg-red-500/80'
                            } ${isRinging || showEndNotification ? 'opacity-60' : ''}`}
                        onClick={handleToggleMic}
                        disabled={isRinging || showEndNotification}
                    >
                        {micOn ? (
                            <Mic className="w-8 h-8 text-white" />
                        ) : (
                            <MicOff className="w-8 h-8 text-white" />
                        )}
                    </button>
                    <span className="text-xs text-white/80">mute</span>
                </div>

                {/* End */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-1 ${showEndNotification ? 'opacity-60' : ''
                            }`}
                        onClick={handleEnd}
                        disabled={showEndNotification}
                    >
                        <PhoneOff className="w-8 h-8 text-white" />
                    </button>
                    <span className="text-xs text-white/80">end</span>
                </div>
            </div>

            <audio ref={audioRef} autoPlay />
        </div>
    );
}
