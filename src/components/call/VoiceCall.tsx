'use client';

import { useState, useEffect } from 'react';
import { User, Mic, MicOff, PhoneOff, Volume2, VolumeX, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceCallProps {
    contactName: string;
    contactAvatar?: string;
    onEndCall: () => void;
    onSwitchToVideo?: () => void;
}

export function VoiceCall({ contactName, contactAvatar, onEndCall, onSwitchToVideo }: VoiceCallProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#1c1c1e] to-black">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />

            <div className="relative flex flex-col items-center space-y-8 p-4">
                {/* Avatar Section */}
                <div className="relative">
                    <Avatar className="w-40 h-40 border-4 border-primary/20">
                        {contactAvatar ? (
                            <img
                                src={contactAvatar}
                                alt={contactName}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <User className="w-20 h-20 text-primary/60" />
                            </div>
                        )}
                    </Avatar>

                    {/* Ripple Effect */}
                    <div className="absolute -inset-4">
                        <div className="w-48 h-48 rounded-full border-4 border-primary/20 animate-ping" />
                    </div>
                </div>

                {/* Call Info */}
                <div className="text-center space-y-2 z-10">
                    <h2 className="text-2xl font-bold text-white">{contactName}</h2>
                    <p className="text-primary/80 font-medium">{formatDuration(callDuration)}</p>
                </div>

                {/* Call Controls */}
                <div className="flex items-center justify-center space-x-6 z-10">
                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                "rounded-full w-16 h-16 bg-white/10 hover:bg-white/20 transition-all duration-200",
                                isMuted && "bg-red-500/50 hover:bg-red-600/50 text-white"
                            )}
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? (
                                <MicOff className="h-8 w-8 text-white" />
                            ) : (
                                <Mic className="h-8 w-8 text-white" />
                            )}
                        </Button>
                        <span className="text-xs text-white/60">
                            {isMuted ? 'Unmute' : 'Mute'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="destructive"
                            className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/30"
                            onClick={onEndCall}
                        >
                            <PhoneOff className="h-8 w-8" />
                        </Button>
                        <span className="text-xs text-white/60">End</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                "rounded-full w-16 h-16 bg-white/10 hover:bg-white/20 transition-all duration-200",
                                isSpeakerOn && "bg-primary/50 hover:bg-primary/70 text-white"
                            )}
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        >
                            {isSpeakerOn ? (
                                <Volume2 className="h-8 w-8 text-white" />
                            ) : (
                                <VolumeX className="h-8 w-8 text-white" />
                            )}
                        </Button>
                        <span className="text-xs text-white/60">
                            {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className="rounded-full w-16 h-16 bg-white/10 hover:bg-white/20 transition-all duration-200"
                            onClick={onSwitchToVideo}
                        >
                            <Video className="h-8 w-8 text-white" />
                        </Button>
                        <span className="text-xs text-white/60">Switch to Video</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 