'use client';

import { useState, useEffect, useRef } from 'react';
import {
    User, Mic, MicOff, PhoneOff,
    Volume2, VolumeX, Video, ChevronLeft, Lock
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';

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
        upgradeToVideo
    } = useCallStore();

    const state = callState ?? storeState;
    // ref để giữ trạng thái trước đó
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
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [internalCallDuration, setInternalCallDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.muted = !isSpeakerOn;
        }
    }, [remoteStream, isSpeakerOn]);

    useEffect(() => {
        let timer: number | undefined;
        if (state === 'connected') {
            timer = window.setInterval(() => setInternalCallDuration((t) => t + 1), 1000);
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

    const handleSwitchToVideo = async () => {
        await upgradeToVideo();
        const calleeId = params.get('calleeId');
        const contact = params.get('contact') || contactName;
        router.replace(`/call/video?calleeId=${calleeId}&contact=${encodeURIComponent(contact)}`);
    };

    const handleToggleMic = () => {
        toggleMic(!micOn);
    };

    // Speaker/earpiece logic for mobile
    const [audioOutput, setAudioOutput] = useState<'speaker' | 'earpiece'>('speaker');

    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleToggleSpeaker = async () => {
        if (audioRef.current && 'setSinkId' in audioRef.current && isMobile) {
            const newOutput = audioOutput === 'speaker' ? 'earpiece' : 'speaker';
            try {
                await (audioRef.current as any).setSinkId(newOutput === 'speaker' ? 'speaker' : 'default');
                setAudioOutput(newOutput);
            } catch (err) {
                alert('Không thể chuyển loa: ' + (err instanceof Error ? err.message : String(err)));
            }
        } else {
            // Toggle mute for desktop or unsupported mobile
            if (audioRef.current) {
                audioRef.current.muted = !audioRef.current.muted;
                setIsSpeakerOn(!audioRef.current.muted);
            }
        }
    };

    const isRinging = state === 'ringing' || state === 'connecting' || state === 'incoming';

    return (
        <div
            className="relative flex flex-col items-center justify-between min-h-screen w-full"
            style={{
                background: isRinging
                    ? 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)'
                    : 'linear-gradient(160deg, #6fb0d2 0%, #a3e4a0 100%)',
            }}
        >
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 pt-4">
                <button className="flex items-center gap-1 text-white/90 text-lg">
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
                    <div className="pulse-ring"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 border-4 border-white/30 flex items-center justify-center z-10">
                        <span className="text-6xl text-white font-bold">
                            {contactName?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="text-white text-2xl font-semibold">{contactName}</div>
                    {isRinging ? (
                        <div className="text-white/90 text-lg mt-1 font-normal tracking-wide">Requesting ...</div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-white/80 text-sm">📶</span>
                            <span className="text-white/80 text-lg font-mono">{formatDuration(callDuration ?? internalCallDuration)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-12 mt-auto">
                {/* Speaker/Earpiece */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur ${isRinging ? 'opacity-60' : ''}`}
                        onClick={handleToggleSpeaker}
                        disabled={isRinging}
                    >
                        {isMobile
                            ? (audioOutput === 'speaker' ? <Volume2 className="w-8 h-8 text-white" /> : <VolumeX className="w-8 h-8 text-white/60" />)
                            : (isSpeakerOn ? <Volume2 className="w-8 h-8 text-white" /> : <VolumeX className="w-8 h-8 text-white/60" />)
                        }
                    </button>
                    <span className="text-xs text-white/80">
                        {isMobile
                            ? (audioOutput === 'speaker' ? 'loa ngoài' : 'loa trong')
                            : (isSpeakerOn ? 'bật tiếng' : 'tắt tiếng')
                        }
                    </span>
                </div>

                {/* Video (temporarily hidden) */}
                {/*
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur ${isRinging ? 'opacity-60' : ''}`}
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
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${micOn ? 'bg-white/20' : 'bg-red-500/80'} ${isRinging ? 'opacity-60' : ''}`}
                        onClick={handleToggleMic}
                        disabled={isRinging}
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

            <audio ref={audioRef} autoPlay />
        </div>
    );
}


