'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
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
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [internalDuration, setInternalDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [lastLocalTrackId, setLastLocalTrackId] = useState<string | undefined>();

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
        <div className="relative w-full h-screen dark:bg-[#7c7c80] dark:text-white overflow-hidden">
            {/* Remote video */}
            {state === 'connected' ? (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
            ) : (
                <div className="absolute inset-0 dark:bg-black flex items-center justify-center dark:text-white text-xl font-medium">
                    Đang chờ đối phương chấp nhận...
                </div>
            )}

            {/* Local PiP */}
            <div className="absolute top-4 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
                {!cameraOn && (
                    <div className="absolute inset-0 dark:bg-[#7c7c80] flex items-center justify-center">
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
                    <ControlButton
                        onClick={() => toggleMic(!micOn)}
                        active={micOn}
                        icon={micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        label={micOn ? 'Mute' : 'Unmute'}
                    />
                    <ControlButton
                        onClick={async () => {
                            if (!cameraOn) {
                                // Lần đầu bật video: renegotiate
                                await upgradeToVideo();
                            } else {
                                // Tắt video chỉ disable track
                                await toggleCamera(false);
                            }
                            setCameraOn(!cameraOn);
                        }}

                        active={cameraOn}
                        icon={cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        label={cameraOn ? 'Stop Video' : 'Start Video'}
                    />
                    <ControlButton
                        onClick={() => setSpeakerOn((v) => !v)}
                        active={speakerOn}
                        icon={speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        label={speakerOn ? 'Speaker' : 'Muted'}
                    />
                    <div className="flex flex-col items-center">
                        <button
                            onClick={handleEnd}
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
