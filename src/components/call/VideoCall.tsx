'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Camera, SignalHigh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoCallProps {
    contactName: string;
    onEndCall: () => void;
}

export function VideoCall({ contactName, onEndCall }: VideoCallProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
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
        <div className="relative h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                <div className="absolute inset-0 bg-[url('/video-placeholder.jpg')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* Connection Status */}
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                <SignalHigh className="w-4 h-4 text-green-500" />
                <span className="text-xs text-white/80">HD</span>
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-[180px] h-[101px] rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                <div className="absolute inset-0 bg-gray-800/90" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/50 text-sm">Your camera</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Call Info */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <h2 className="text-xl font-semibold text-white mb-1">{contactName}</h2>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span>{formatDuration(callDuration)}</span>
                    <span>•</span>
                    <span>Video Call</span>
                </div>
            </div>

            {/* Video Call Controls */}
            <div className="absolute bottom-8 inset-x-0">
                <div className="relative">
                    {/* Background blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent h-40" />

                    {/* Controls container */}
                    <div className="relative flex justify-center items-end h-32">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className={cn(
                                        "rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm",
                                        isMuted && "bg-red-500/50 hover:bg-red-600/50 text-white"
                                    )}
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? (
                                        <MicOff className="h-6 w-6 text-white" />
                                    ) : (
                                        <Mic className="h-6 w-6 text-white" />
                                    )}
                                </Button>
                                <span className="text-xs text-white/80 mt-2">Mic</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/30"
                                    onClick={onEndCall}
                                >
                                    <PhoneOff className="h-7 w-7" />
                                </Button>
                                <span className="text-xs text-white/80 mt-2">End</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className={cn(
                                        "rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm",
                                        !isVideoEnabled && "bg-red-500/50 hover:bg-red-600/50 text-white"
                                    )}
                                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                >
                                    {isVideoEnabled ? (
                                        <Video className="h-6 w-6 text-white" />
                                    ) : (
                                        <VideoOff className="h-6 w-6 text-white" />
                                    )}
                                </Button>
                                <span className="text-xs text-white/80 mt-2">Video</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                                    onClick={() => { }}
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </Button>
                                <span className="text-xs text-white/80 mt-2">Camera</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 