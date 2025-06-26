'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mic, MicOff, PhoneOff, Volume2, VolumeX, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useCallStore from '@/stores/useCallStore';
import { callService } from '@/services/callService';

interface VoiceCallProps {
    contactName: string;
    contactAvatar?: string;
    callState?: string;
    callDuration?: number;
    onEndCall: () => void;
    onSwitchToVideo?: () => void;
}

export function VoiceCall({
    contactName,
    contactAvatar,
    callState, // <-- Thêm ở đây
    onEndCall,
    onSwitchToVideo,
}: VoiceCallProps) {
    const { remoteStream, state: storeState, hangup } = useCallStore();

    // Nếu callState truyền vào, ưu tiên dùng, không thì fallback về state của store
    const state = callState ?? storeState;

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.muted = !isSpeakerOn;
        }
    }, [remoteStream, isSpeakerOn]);

    useEffect(() => {
        if (remoteStream) {
            remoteStream.getAudioTracks().forEach((t) => {
                t.enabled = !isMuted;
            });
        }
    }, [isMuted, remoteStream]);

    useEffect(() => {
        let timer: number | undefined;
        if (state === 'connected') {
            timer = window.setInterval(() => setCallDuration((t) => t + 1), 1000);
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
        if (onSwitchToVideo) {
            await onSwitchToVideo();
        } else {
            // Nếu không truyền prop, fallback luôn gọi upgrade
            await callService.upgradeToVideo();
        }
    };

    const renderCallStatus = () => {
        if (state === 'connected') {
            return formatDuration(callDuration);
        }
        if (state === 'ringing') {
            return 'Đang đổ chuông...';
        }
        if (state === 'connecting') {
            return 'Đang kết nối...';
        }
        if (state === 'ended') {
            return 'Cuộc gọi đã kết thúc';
        }
        if (state === 'incoming') {
            return 'Có cuộc gọi đến...';
        }
        return 'Đang gọi...';
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen dark:bg-black">
            <audio ref={audioRef} autoPlay hidden />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-black to-black" />

            <div className="relative flex flex-col items-center space-y-8 p-4 z-10">
                <div className="relative">
                    <Avatar className="w-40 h-40 border-4 border-[#0088CC]/20">
                        {contactAvatar ? (
                            <img src={contactAvatar} alt={contactName} className="rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br dark:from-[#0088CC]/20 dark:to-[#0088CC]/10 flex items-center justify-center">
                                <User className="w-20 h-20 dark:text-[#0088CC]/60" />
                            </div>
                        )}
                    </Avatar>
                    {state === 'ringing' && (
                        <div className="absolute -inset-4 animate-ping rounded-full border-4 border-[#0088CC]/20" />
                    )}
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold dark:text-white">{contactName}</h2>
                    <p className="text-[#0088CC] font-medium">{renderCallStatus()}</p>
                </div>

                <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                'rounded-full w-16 h-16 transition-all duration-200 border',
                                isMuted ? 'bg-red-600/80 hover:bg-red-700/80' : 'dark:bg-[#2C2C2E]'
                            )}
                            onClick={() => setIsMuted((v) => !v)}
                        >
                            {isMuted ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 dark:text-white" />}
                        </Button>
                        <span className="text-xs dark:text-white/80">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <Button
                            size="lg"
                            variant="destructive"
                            className="rounded-full w-16 h-16 bg-[#FF3B30] hover:bg-[#FF453A] transition-all duration-200"
                            onClick={handleEnd}
                        >
                            <PhoneOff className="h-8 w-8 dark:text-white" />
                        </Button>
                        <span className="text-xs dark:text-white/80">End</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                'rounded-full w-16 h-16 transition-all duration-200 border',
                                isSpeakerOn ? 'dark:bg-[#2C2C2E]' : 'bg-red-600/80 hover:bg-red-700/80'
                            )}
                            onClick={() => setIsSpeakerOn((v) => !v)}
                        >
                            {isSpeakerOn ? <Volume2 className="h-8 w-8 dark:text-white" /> : <VolumeX className="h-8 w-8 text-white" />}
                        </Button>
                        <span className="text-xs dark:text-white/80">{isSpeakerOn ? 'Speaker On' : 'Speaker Off'}</span>
                    </div>

                    {onSwitchToVideo && (
                        <div className="flex flex-col items-center">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="rounded-full w-16 h-16 dark:bg-[#2C2C2E] transition-all duration-200 border"
                                onClick={handleSwitchToVideo}
                            >
                                <Video className="h-8 w-8 dark:text-white" />
                            </Button>
                            <span className="text-xs dark:text-white/80">Switch to Video</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
