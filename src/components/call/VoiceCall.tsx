'use client';

import { useState, useEffect, useRef } from 'react';
import {
    User,
    Mic,
    MicOff,
    Phone,
    Volume2,
    VolumeX,
    Video,
    ChevronLeft,
    Lock,
    UserPlus, ChevronUp, ChevronDown
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';
import { getHeaderStyleWithStatusBar } from '@/utils/getHeaderStyleWithStatusBar';

interface VoiceCallProps {
    contactName: string;
    contactAvatar?: string;
    callState?: string;
    callDuration?: number;
    onEndCall: () => void;
    onUpgrade?: () => void;
}

export function VoiceCall({
    contactName,
    callState,
    callDuration,
    contactAvatar,
    onUpgrade,
    onEndCall,
}: VoiceCallProps) {
    const {
        remoteStream,
        micOn,
        toggleMic,
        state: storeState,
        hangup,

    } = useCallStore();

    const state = callState ?? storeState;

    // Giữ previous state để detect transition
    const prevStateRef = useRef<string>(state);
    // Flag để ensure chỉ schedule 1 lần
    const notifiedRef = useRef<boolean>(false);
    // Để clear timeout khi unmount
    const timeoutRef = useRef<number | null>(null);

    // UI state
    const [showEndNotification, setShowEndNotification] = useState<boolean>(false);
    const [finalCallDuration, setFinalCallDuration] = useState<number>(0);
    const [internalCallDuration, setInternalCallDuration] = useState<number>(0);

    // Audio states - tách riêng cho từng chức năng
    const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true); // Cho tắt tiếng
    const [audioOutput, setAudioOutput] = useState<'speaker' | 'earpiece'>('speaker'); // Cho loa trong/ngoài
    const audioRef = useRef<HTMLAudioElement>(null);

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
            const duration = callDuration ?? internalCallDuration;
            setFinalCallDuration(duration);

            setShowEndNotification(true);

            timeoutRef.current = window.setTimeout(() => {
                setShowEndNotification(false);
                onEndCall();
            }, 10_000);
        }

        prevStateRef.current = state;
    }, [state, callDuration, internalCallDuration, onEndCall]);

    // Gán stream vào audio element
    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.muted = !isSpeakerOn;
        }
    }, [remoteStream, isSpeakerOn]);

    // Đếm thời gian khi connected
    useEffect(() => {
        let timer: number;
        if (state === 'connected') {
            timer = window.setInterval(() => {
                setInternalCallDuration((t) => t + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Handlers
    const handleEnd = () => {
        hangup();
        // onEndCall sẽ do timeout xử lý
    };
    const handleCloseEndNotification = () => {
        setShowEndNotification(false);
        onEndCall();
    };

    const router = useRouter();
    const params = useSearchParams();
    const [toolsOpen, setToolsOpen] = useState(false);

    // Handler thêm người
    const handleAddGroup = () => {
        // TODO: mở modal hoặc điều hướng để chọn người, rồi client.invite(...)
        console.log('Add group functionality');
    };

    // Handler dịch thuật
    const handleTranslate = () => {
        // TODO: bật chế độ dịch
        console.log('Translate functionality');
    };

    const handleToggleMic = () => {
        toggleMic(!micOn);
    };

    // Mobile detection
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Handler cho chuyển đổi loa trong/ngoài (riêng biệt)
    const handleToggleAudioOutput = async () => {
        if (audioRef.current && 'setSinkId' in audioRef.current && isMobile) {
            const next = audioOutput === 'speaker' ? 'earpiece' : 'speaker';
            try {
                await (audioRef.current as any).setSinkId(
                    next === 'speaker' ? 'speaker' : 'default'
                );
                setAudioOutput(next);
            } catch (err) {
                console.warn('Không thể chuyển loa:', err);
                // Fallback: toggle visual state anyway
                setAudioOutput(next);
            }
        } else {
            // Desktop/fallback: just toggle state
            setAudioOutput(audioOutput === 'speaker' ? 'earpiece' : 'speaker');
        }
    };

    // Handler cho tắt/bật tiếng (sử dụng handleToggleSpeaker như yêu cầu)
    const handleToggleSpeaker = () => {
        const newState = !isSpeakerOn;
        setIsSpeakerOn(newState);

        if (audioRef.current) {
            audioRef.current.muted = !newState;
        }
    };

    // Camera toggle
    const [isCameraOn, setIsCameraOn] = useState(false);
    const handleToggleCamera = async () => {
        const next = !isCameraOn;
        setIsCameraOn(next);
        if (next) {
            try {
                // 1) Yêu cầu upgrade để thêm track video
                onUpgrade?.();
                // 2) Việc điều hướng chuyển layout để khi remoteStream đã sẵn sàng
            } catch (err) {
                console.error("Chuyển sang video thất bại:", err);
            }
        }
    };

    const headerStyle = getHeaderStyleWithStatusBar();

    const isRinging = ['ringing', 'connecting', 'incoming'].includes(state);

    const dynamicBgStyle: React.CSSProperties = contactAvatar
        ? {
            backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.591), rgba(255, 255, 255, 0.509)),
        url(${contactAvatar})
      `,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : {
            background: isRinging || showEndNotification
                ? "linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)"
                : "linear-gradient(160deg, #6fb0d2 0%, #a3e4a0 100%)",
        };

    return (
        <div
            className="relative flex flex-col items-center justify-between min-h-screen w-full"
            style={dynamicBgStyle}
        >
            {/* Header */}
            <header
                style={headerStyle}
                className="sticky top-0 z-10 w-full bg-transparent"
            >
                <div className="flex items-center justify-between px-4 pt-4">
                    {/* Back button */}
                    <button
                        onClick={showEndNotification ? handleCloseEndNotification : undefined}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2"
                    >
                        <ChevronLeft className="w-6 h-6 text-black" />
                    </button>

                    {/* Camera toggle */}
                    <button
                        onClick={handleToggleCamera}
                        className={`
        relative flex items-center
        w-14 h-8 rounded-full
        bg-white/20 backdrop-blur-md border border-white/30 shadow
        transition-colors
        px-1
    `}
                        aria-label="Chuyển camera"
                    >
                        <span
                            className={`
        flex items-center justify-center
        w-6 h-6 rounded-full
        ${isCameraOn
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white/20 hover:bg-white/30 backdrop-blur border-white/30'
                                }
        transition-colors transition-transform
        ${isCameraOn ? 'translate-x-6' : 'translate-x-0'}
    `}
                        >
                            <Video className="w-5 h-5 text-white" />
                        </span>
                    </button>
                </div>
            </header>

            {/* Avatar with Pulse */}
            <div className="flex flex-col items-center mt-12">
                <div className="mt-6 text-center">

                    {showEndNotification ? (
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
                    ) : isRinging ? (
                        <div className="text-white/90 text-lg mt-1 font-normal tracking-wide">
                            Requesting ...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-white/80 text-lg font-mono">
                                    {formatDuration(callDuration ?? internalCallDuration)}
                                </span>
                            </div>
                            {/* Tên người gọi nằm dưới đồng hồ */}
                            <div className="text-white text-2xl font-semibold mt-1">
                                {contactName}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full mb-12 mt-auto">
                {/* Row 1: End Call và Translate trên cùng một hàng */}
                <div className="flex items-start justify-between w-full px-4 mb-6">
                    {/* Khoảng trống bên trái */}
                    <div className="w-12"></div>

                    {/* End Call - nút đỏ lớn ở giữa */}
                    <button
                        onClick={handleEnd}
                        disabled={showEndNotification}
                        className="flex flex-col items-center group"
                        aria-label="End call"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-disabled:opacity-60">
                            <Phone className="w-8 h-8 text-white rotate-[135deg]" />
                        </div>
                        <span className="mt-1 text-xs text-gray-200 font-medium select-none">Kết thúc</span>
                    </button>

                    {/* Translate - nút nhỏ bên phải */}
                    <button
                        onClick={handleTranslate}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors"
                        aria-label="Translate"
                    >
                        {/* Google Dịch style icon */}
                        <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                            <text x="3" y="20" fontSize="16" fontFamily="Arial" fill="black">文</text>
                            <text x="15" y="24" fontSize="14" fontFamily="Arial" fill="black">A</text>
                        </svg>
                    </button>
                </div>

                {/* Panel với nút mũi tên */}
                <div className="pointer-events-auto flex justify-center">
                    {toolsOpen ? (
                        // Khi mở: hiển thị khung panel đầy đủ
                        <div
                            className="bg-transparent backdrop-blur-md border border-white/30 rounded-2xl transition-all duration-300 ease-in-out"
                            style={{
                                boxShadow: '0 12px 32px -8px rgba(255,255,255,0.18)',
                            }}
                        >
                            {/* Nút mũi tên để đóng */}
                            <div className="flex justify-center px-7 py-1">
                                <button
                                    onClick={() => setToolsOpen((o) => !o)}
                                    className="w-8 h-8 flex items-center justify-center"
                                    aria-label="Close tools"
                                >
                                    <ChevronDown className="w-5 h-5 text-black" />
                                </button>
                            </div>

                            {/* 3 nút trong panel */}
                            <div className="px-6 pb-6">
                                <div className="flex justify-center gap-8">
                                    {/* Loa ngoài - Chuyển đổi loa trong/ngoài (riêng biệt) */}
                                    <button
                                        onClick={handleToggleAudioOutput}
                                        className="flex flex-col items-center"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors mb-2
                     ${audioOutput === 'speaker'
                                                    ? 'bg-gray-500/80 border-blue-400/80'
                                                    : 'bg-white/20 hover:bg-white/30 backdrop-blur border-white/30'
                                                }`
                                            }
                                        >
                                            <Volume2 className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xs text-white/90 font-medium">Loa ngoài</span>
                                    </button>

                                    {/* Thêm nhóm */}
                                    <button
                                        onClick={handleAddGroup}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2">
                                            <UserPlus className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xs text-white/90 font-medium">Thêm nhóm</span>
                                    </button>

                                    {/* Tắt tiếng - Sử dụng handleToggleSpeaker */}
                                    <button
                                        onClick={handleToggleSpeaker}
                                        className="flex flex-col items-center"
                                    >
                                        <div className={`w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2 ${isSpeakerOn
                                            ? 'bg-gray-500/40 border-gray-400/30'
                                            : 'bg-red-500/60 border-red-400/50'
                                            }`}>
                                            {isSpeakerOn
                                                ? <Volume2 className="w-6 h-6 text-white" />
                                                : <VolumeX className="w-6 h-6 text-white" />
                                            }
                                        </div>
                                        <span className="text-xs text-white/90 font-medium">Tắt tiếng</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Khi đóng: chỉ hiển thị nút mũi tên
                        <div className="flex justify-center">
                            <button
                                onClick={() => setToolsOpen((o) => !o)}
                                className="w-8 h-8 flex items-center justify-center"
                                aria-label="Open tools"
                            >
                                <ChevronUp className="w-5 h-5 text-black" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <audio ref={audioRef} autoPlay />
        </div>
    );
}