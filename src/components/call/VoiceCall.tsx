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
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-black to-black" />

            <div className="relative flex flex-col items-center space-y-8 p-4">
                {/* Avatar Section */}
                <div className="relative">
                    <Avatar className="w-40 h-40 border-4 border-[#0088CC]/20">
                        {contactAvatar ? (
                            <img
                                src={contactAvatar}
                                alt={contactName}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br dark:from-[#0088CC]/20 dark:to-[#0088CC]/10 flex items-center justify-center">
                                <User className="w-20 h-20 dark:text-[#0088CC]/60" />
                            </div>
                        )}
                    </Avatar>

                    {/* Ripple Effect */}
                    <div className="absolute -inset-4">
                        <div className="w-48 h-48 rounded-full border-4 border-[#0088CC]/20 animate-ping" />
                    </div>
                </div>

                {/* Call Info */}
                <div className="text-center space-y-2 z-10">
                    <h2 className="text-2xl font-bold dark:text-white">{contactName}</h2>
                    <p className="text-[#0088CC] font-medium">{formatDuration(callDuration)}</p>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t dark:from-black dark:via-black/90 to-transparent" />

                {/* Call Controls */}
                <div className="relative flex items-center justify-center space-x-6 z-10">
                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                "rounded-full w-16 h-16 dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E] transition-all duration-200 border"
                            )}
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? (
                                <MicOff className="h-8 w-8 text-red-500" />
                            ) : (
                                <Mic className="h-8 w-8 dark:text-white" />
                            )}
                        </Button>
                        <span className="text-xs dark:text-white/80">
                            {isMuted ? 'Unmute' : 'Mute'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="destructive"
                            className="rounded-full w-16 h-16 bg-[#FF3B30] hover:bg-[#FF453A] transition-all duration-200"
                            onClick={onEndCall}
                        >
                            <PhoneOff className="h-8 w-8 dark:text-white" />
                        </Button>
                        <span className="text-xs dark:text-white/80">End</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className={cn(
                                "rounded-full w-16 h-16 dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E] transition-all duration-200 border"
                            )}
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        >
                            {isSpeakerOn ? (
                                <Volume2 className="h-8 w-8 dark:text-white" />
                            ) : (
                                <VolumeX className="h-8 w-8 text-red-500" />
                            )}
                        </Button>
                        <span className="text-xs dark:text-white/80">
                            {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            size="lg"
                            variant="ghost"
                            className="rounded-full w-16 h-16 dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E] transition-all duration-200 border"
                            onClick={onSwitchToVideo}
                        >
                            <Video className="h-8 w-8 dark:text-white" />
                        </Button>
                        <span className="text-xs dark:text-white/80">Switch to Video</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 