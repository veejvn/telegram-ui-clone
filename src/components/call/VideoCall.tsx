'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, ChevronLeft, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useCallStore from '@/stores/useCallStore';
import { callService } from '@/services/callService';
import { getHeaderStyleWithStatusBar } from '@/utils/getHeaderStyleWithStatusBar';

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
    const headerStyle = getHeaderStyleWithStatusBar();

    // Giữ previous state để detect transition
    const prevStateRef = useRef<string>(state);
    // Flag để ensure chỉ schedule 1 lần
    const notifiedRef = useRef<boolean>(false);
    // Để clear timeout khi unmount
    const timeoutRef = useRef<number | null>(null);

    // UI state
    const [showEndNotification, setShowEndNotification] = useState<boolean>(false);
    const [finalCallDuration, setFinalCallDuration] = useState<number>(0);
    const [internalDuration, setInternalDuration] = useState(0);

    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [lastLocalTrackId, setLastLocalTrackId] = useState<string | undefined>();

    // Thêm trạng thái preview
    const [showPreview, setShowPreview] = useState(false);

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
            const duration = callDuration ?? internalDuration;
            setFinalCallDuration(duration);

            setShowEndNotification(true);

            timeoutRef.current = window.setTimeout(() => {
                setShowEndNotification(false);
                onEndCall();
            }, 10_000);
        }

        prevStateRef.current = state;
    }, [state, callDuration, internalDuration, onEndCall]);

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

    // Khi bắt đầu gọi video, show preview trước
    useEffect(() => {
        if (state === 'calling' && cameraOn) {
            setShowPreview(true);
        } else {
            setShowPreview(false);
        }
    }, [state, cameraOn]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEnd = () => {
        hangup();
        // onEndCall sẽ do timeout xử lý
    };

    const handleCloseEndNotification = () => {
        setShowEndNotification(false);
        onEndCall();
    };

    // Khi showPreview, có thể return null hoặc logic khác nếu cần
    if (showPreview) {
        return null;
    }

    const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

    // Flip camera handler
    const handleFlipCamera = async () => {
        const newFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: newFacingMode } },
                audio: false,
            });
            // Replace video track in localStream and peer connection
            const newVideoTrack = newStream.getVideoTracks()[0];
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream;
            }
            // Replace track in peer connection if possible
            if (callService && (callService as any).currentCall) {
                const callAny = (callService as any).currentCall;
                const pc = callAny.peerConn;
                const videoSender = pc.getSenders().find((s: RTCRtpSender) => s.track && s.track.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(newVideoTrack);
                }
            }
            setCameraFacingMode(newFacingMode);
        } catch (err) {
            alert('Không thể chuyển camera: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const isRinging = ['ringing', 'connecting', 'incoming'].includes(state);

    // Nếu đang hiển thị thông báo call ended, hiển thị UI tương tự voice call
    if (showEndNotification) {
        return (
            <div
                className="relative flex flex-col items-center justify-between min-h-screen w-full"
                style={{
                    background: 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)',
                }}

            >
                {/* Header */}
                <header
                    style={headerStyle}
                    className="sticky top-0 z-10 w-full bg-transparent"
                >
                    <div className="flex items-center justify-between px-4 pt-4">                    <button
                        className="flex items-center gap-1 text-white/90 text-lg"
                        onClick={handleCloseEndNotification}
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
                    <div className="text-3xl">🧱🐷🐱🚂</div>
                    <div className="mt-2 bg-white/20 rounded-xl px-4 py-1 text-white text-sm flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Encryption key of this call
                    </div>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mt-12">
                    <div className="relative w-40 h-40">
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
                    </div>
                </div>

                {/* Controls (disabled) */}
                <div className="flex items-center justify-center gap-6 mb-12 mt-auto">
                    <div className="flex flex-col items-center">
                        <button
                            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur opacity-60"
                            disabled
                        >
                            <Volume2 className="w-8 h-8 text-white/60" />
                        </button>
                        <span className="text-xs text-white/80">speaker</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur opacity-60"
                            disabled
                        >
                            <Video className="w-8 h-8 text-white/60" />
                        </button>
                        <span className="text-xs text-white/80">video</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur opacity-60"
                            disabled
                        >
                            <Mic className="w-8 h-8 text-white/60" />
                        </button>
                        <span className="text-xs text-white/80">mute</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-1 opacity-60"
                            disabled
                        >
                            <PhoneOff className="w-8 h-8 text-white" />
                        </button>
                        <span className="text-xs text-white/80">end</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Remote video background */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1, background: '#000' }}
            />

            {/* Local PiP */}
            {cameraOn && (
                <div className="absolute bottom-32 right-4 w-28 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-lg z-20 bg-black/40">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }}
                    />
                </div>
            )}

            {/* Thông báo khi tắt camera */}
            {!cameraOn && (
                <div className="absolute bottom-36 right-6 z-30 bg-black/70 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <VideoOff className="w-5 h-5 text-white/80" />
                    <span className="text-white text-sm font-medium">Your camera is off</span>
                </div>
            )}

            {/* Header */}
            <header
                style={headerStyle}
                className="sticky top-0 z-30 w-full bg-transparent"
            >
                <div className="flex flex-col items-center pt-6">
                    <div className="flex items-center justify-between w-full px-4 relative">
                        <button className="flex items-center gap-1 text-white/90 text-lg" onClick={handleEnd}>
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full px-3 py-0.5 text-xs font-bold">
                            Ting Tong
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white/80" />
                        </div>
                    </div>
                    {/* <div className="mt-2 text-2xl">🧱🐷🐱🚂</div> */}
                    <div className="mt-2 text-center">
                        <div className="text-white text-2xl font-semibold drop-shadow">{contactName}</div>
                        {isRinging ? (
                            <div className="text-white/90 text-lg mt-1 font-normal tracking-wide">
                                Requesting ...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-white/80 text-base">📶</span>
                                <span className="text-white/80 text-lg font-mono">{formatDuration(callDuration ?? internalDuration)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 w-full flex items-center justify-center gap-6 z-30">
                {/* Flip camera */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-1 backdrop-blur ${isRinging ? 'opacity-60' : ''}`}
                        onClick={handleFlipCamera}
                        disabled={isRinging}
                    >
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l2 2 2-2m-2 2V7m-6 0l-2-2-2 2m2-2v12" /></svg>
                    </button>
                    <span className="text-xs text-white/80">flip</span>
                </div>
                {/* Video */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${cameraOn ? 'bg-white/20' : 'bg-red-500/80'} ${isRinging ? 'opacity-60' : ''}`}
                        onClick={() => {
                            if (!cameraOn) {
                                upgradeToVideo();
                            } else {
                                toggleCamera(false);
                            }
                            setCameraOn(!cameraOn);
                        }}
                        disabled={isRinging}
                    >
                        {cameraOn ? <Video className="w-8 h-8 text-white" /> : <VideoOff className="w-8 h-8 text-white" />}
                    </button>
                    <span className="text-xs text-white/80">video</span>
                </div>
                {/* Mute */}
                <div className="flex flex-col items-center">
                    <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 backdrop-blur ${micOn ? 'bg-white/20' : 'bg-red-500/80'} ${isRinging ? 'opacity-60' : ''}`}
                        onClick={() => toggleMic(!micOn)}
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