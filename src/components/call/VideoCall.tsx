'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCallProps {
    contactName: string;
    onEndCall: () => void;
}

export function VideoCall({ contactName, onEndCall }: VideoCallProps) {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Đếm thời gian cuộc gọi
    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Lấy local stream từ camera
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error('Không thể truy cập camera/mic:', err));

        return () => {
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    // Bật/tắt mic
    useEffect(() => {
        localStream?.getAudioTracks().forEach((track) => {
            track.enabled = micOn;
        });
    }, [micOn, localStream]);

    // Bật/tắt camera
    useEffect(() => {
        localStream?.getVideoTracks().forEach((track) => {
            track.enabled = cameraOn;
        });
    }, [cameraOn, localStream]);

    return (
        <div className="relative w-full h-screen dark:bg-[#1C1C1E] dark:text-white overflow-hidden">
            {/* Remote video */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b dark:from-[#1C1C1E]/40 dark:via-[#1C1C1E] dark:to-[#1C1C1E]" />
                <video
                    autoPlay
                    playsInline
                    ref={remoteVideoRef}
                    className="w-full h-full object-cover opacity-80"
                    id="remoteVideo"
                />
            </div>

            {/* Local video (PiP) */}
            <div className="absolute top-4 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <video
                    autoPlay
                    playsInline
                    muted
                    ref={localVideoRef}
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
                    <span className="text-sm dark:text-gray-300">{formatDuration(callDuration)}</span>
                </div>
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-24 inset-x-0 pb-6 pt-20 bg-gradient-to-t dark:from-[#1C1C1E] dark:via-[#1C1C1E]/80 dark:to-transparent">
                <div className="flex justify-center gap-8">
                    {/* Mic */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setMicOn(!micOn)}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                                micOn ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]' : 'bg-red-500/80 hover:bg-red-600/80'
                            )}
                        >
                            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>
                        <span className="text-xs dark:text-white/80">{micOn ? 'Mute' : 'Unmute'}</span>
                    </div>

                    {/* Camera */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setCameraOn(!cameraOn)}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                                cameraOn ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]' : 'bg-red-500/80 hover:bg-red-600/80'
                            )}
                        >
                            {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        </button>
                        <span className="text-xs dark:text-white/80">
                            {cameraOn ? 'Stop Video' : 'Start Video'}
                        </span>
                    </div>

                    {/* Speaker */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setSpeakerOn(!speakerOn)}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                                speakerOn ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]' : 'bg-red-500/80 hover:bg-red-600/80'
                            )}
                        >
                            {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        </button>
                        <span className="text-xs dark:text-white/80">{speakerOn ? 'Speaker' : 'Muted'}</span>
                    </div>

                    {/* End Call */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={onEndCall}
                            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors mb-2"
                            title="End Call"
                            aria-label="End Call"
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
