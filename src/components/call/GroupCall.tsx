'use client';

import { useState, useEffect } from 'react';
import { User, Mic, MicOff, PhoneOff, Video, VideoOff, Users, MoreVertical, Share, ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Participant {
    id: string;
    name: string;
    avatar?: string;
    isMuted?: boolean;
    isVideoOn?: boolean;
    isSpeaking?: boolean;
}

interface GroupCallProps {
    groupName: string;
    participants: Participant[];
    onEndCall: () => void;
    isVideoEnabled?: boolean;
}

export function GroupCall({ groupName, participants, onEndCall, isVideoEnabled = false }: GroupCallProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(isVideoEnabled);
    const [callDuration, setCallDuration] = useState(0);
    const [showParticipants, setShowParticipants] = useState(true);

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
        <div className="relative h-screen bg-[#4C6EF5] overflow-hidden">
            {/* Menu Button */}
            <div className="absolute top-4 left-4 z-30">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreVertical className="h-6 w-6" />
                </Button>
            </div>

            {/* Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
                <h1 className="text-white text-lg font-medium">{groupName}</h1>
                <p className="text-white/60 text-sm">{participants.length} participants</p>
            </div>

            {/* Participants Grid */}
            <div className="absolute inset-0 p-4 pt-16">
                <div className="grid grid-cols-2 gap-3 h-full max-h-[calc(100vh-180px)]">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className={cn(
                                "relative rounded-xl overflow-hidden",
                                participant.isVideoOn ? "bg-[#4C6EF5]" : "bg-gray-800/50"
                            )}
                        >
                            {participant.isVideoOn ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Avatar className="w-16 h-16">
                                        {participant.avatar ? (
                                            <img src={participant.avatar} alt={participant.name} className="rounded-full" />
                                        ) : (
                                            <User className="w-8 h-8 text-white/60" />
                                        )}
                                    </Avatar>
                                </div>
                            )}

                            {/* Participant Info */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <span className="text-white text-sm font-medium bg-black/40 px-2.5 py-1 rounded-full">
                                    {participant.name}
                                </span>
                                {participant.isMuted && (
                                    <div className="bg-black/40 p-1 rounded-full">
                                        <MicOff className="w-3.5 h-3.5 text-red-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Controls - Positioned above navigation bar */}
            <div className="absolute bottom-24 inset-x-0 flex justify-center items-center gap-4 z-20">
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-full w-10 h-10",
                            isMuted ? "bg-red-500/50 hover:bg-red-600/50" : "bg-white/10 hover:bg-white/20"
                        )}
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? (
                            <MicOff className="h-5 w-5 text-white" />
                        ) : (
                            <Mic className="h-5 w-5 text-white" />
                        )}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full w-10 h-10 bg-red-500 hover:bg-red-600"
                        onClick={onEndCall}
                    >
                        <PhoneOff className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-full w-10 h-10",
                            isVideoOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/50 hover:bg-red-600/50"
                        )}
                        onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                        {isVideoOn ? (
                            <Video className="h-5 w-5 text-white" />
                        ) : (
                            <VideoOff className="h-5 w-5 text-white" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
} 