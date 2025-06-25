'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import useCallStore from '@/stores/useCallStore';

interface VideoCallProps {
    contactName: string;
    onEndCall: () => void;
}

export function VideoCall({ contactName, onEndCall }: VideoCallProps) {
    const { localStream, remoteStream, state, hangup } = useCallStore();

    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Attach local stream to PiP video
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to background video
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Control mic track
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        }
    }, [micOn, localStream]);

    // Control camera track
    useEffect(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach((t) => (t.enabled = cameraOn));
        }
    }, [cameraOn, localStream]);

    // Control speaker (mute/unmute remote)
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !speakerOn;
        }
    }, [speakerOn]);

    // Call duration timer starts when connected
    useEffect(() => {
        let timer: number;
        if (state === 'connected') {
            timer = window.setInterval(() => setCallDuration((t) => t + 1), 1000);
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    };

    const handleEnd = () => {
        hangup();
        onEndCall();
    };

    return (
        <div className="relative w-full h-screen dark:bg-[#1C1C1E] dark:text-white overflow-hidden">
            {/* Remote video */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Local video (PiP) */}
            <div className="absolute top-4 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
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
                    <span className="text-sm dark:text-gray-300">
                        {formatDuration(callDuration)}
                    </span>
                </div>
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-24 inset-x-0 pb-6 pt-20 bg-gradient-to-t dark:from-[#1C1C1E] dark:via-[#1C1C1E]/80 dark:to-transparent">
                <div className="flex justify-center gap-8">
                    {/* Mic */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setMicOn((v) => !v)}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                                micOn ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]' : 'bg-red-500/80 hover:bg-red-600/80'
                            )}
                        >
                            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>
                        <span className="text-xs dark:text-white/80">
                            {micOn ? 'Mute' : 'Unmute'}
                        </span>
                    </div>

                    {/* Camera */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setCameraOn((v) => !v)}
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
                            onClick={() => setSpeakerOn((v) => !v)}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 border',
                                speakerOn
                                    ? 'dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E]'
                                    : 'bg-red-500/80 hover:bg-red-600/80'
                            )}
                        >
                            {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        </button>
                        <span className="text-xs dark:text-white/80">
                            {speakerOn ? 'Speaker' : 'Muted'}
                        </span>
                    </div>

                    {/* End Call */}
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
