"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  VolumeX,
  ChevronLeft,
  User,
  Lock,
  UserPlus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useCallStore from "@/stores/useCallStore";
import { callService } from "@/services/callService";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

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
    hangup,
  } = useCallStore();

  const state = callState ?? storeState;
  const headerStyle = getHeaderStyleWithStatusBar();
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);

  // Giữ previous state để detect transition
  const prevStateRef = useRef<string>(state);
  const notifiedRef = useRef<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  // UI state
  const [showEndNotification, setShowEndNotification] = useState<boolean>(false);
  const [finalCallDuration, setFinalCallDuration] = useState<number>(0);
  const [internalDuration, setInternalDuration] = useState(0);

  const [cameraOn, setCameraOn] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Layout state - true: local trên, false: remote trên
  const [isLocalOnTop, setIsLocalOnTop] = useState(false);

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
    const wasActive = [
      "incoming",
      "ringing",
      "connecting",
      "connected",
    ].includes(prevStateRef.current);
    const isFinal = state === "ended" || state === "error";

    if (wasActive && isFinal && !notifiedRef.current) {
      notifiedRef.current = true;
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
      remoteStream.getVideoTracks().forEach((track) => {
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
      remoteVideoRef.current.muted = !isSpeakerOn;
    }
  }, [isSpeakerOn]);

  // Timer
  useEffect(() => {
    let timer: number | undefined;
    if (state === "connected") {
      timer = window.setInterval(() => setInternalDuration((t) => t + 1), 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [state]);

  // Khi bắt đầu gọi video, show preview trước
  useEffect(() => {
    if (state === "calling" && cameraOn) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [state, cameraOn]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEnd = () => {
    hangup();
  };

  const handleCloseEndNotification = () => {
    setShowEndNotification(false);
    onEndCall();
  };

  // Handler toggle camera - khi tắt camera thì chuyển sang voice call
  const handleToggleCamera = () => {
    if (cameraOn) {
      // Đang bật camera -> tắt và chuyển sang voice call
      setCameraOn(false);
      toggleCamera(false); // Tắt camera trong store
    } else {
      // Đang tắt camera -> bật lại
      setCameraOn(true);
      toggleCamera(true);
    }
  };

  // Handler chuyển đổi layout
  const handleSwapLayout = () => {
    setIsLocalOnTop(!isLocalOnTop);
  };

  if (showPreview) {
    return null;
  }

  // Handler thêm người
  const handleAddGroup = () => {
    console.log('Add group functionality');
  };

  // Handler dịch thuật
  const handleTranslate = () => {
    console.log('Translate functionality');
  };

  const handleToggleMic = () => {
    toggleMic(!micOn);
  };

  // Audio states
  const [audioOutput, setAudioOutput] = useState<'speaker' | 'earpiece'>('speaker');

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Handler cho chuyển đổi loa trong/ngoài
  const handleToggleAudioOutput = async () => {
    if (remoteVideoRef.current && 'setSinkId' in remoteVideoRef.current && isMobile) {
      const next = audioOutput === 'speaker' ? 'earpiece' : 'speaker';
      try {
        await (remoteVideoRef.current as any).setSinkId(
          next === 'speaker' ? 'speaker' : 'default'
        );
        setAudioOutput(next);
      } catch (err) {
        console.warn('Không thể chuyển loa:', err);
        setAudioOutput(next);
      }
    } else {
      setAudioOutput(audioOutput === 'speaker' ? 'earpiece' : 'speaker');
    }
  };

  // Handler cho tắt/bật tiếng
  const handleToggleSpeaker = () => {
    const newState = !isSpeakerOn;
    setIsSpeakerOn(newState);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !newState;
    }
  };

  const isRinging = ["ringing", "connecting", "incoming"].includes(state);

  // Nếu đang hiển thị thông báo call ended
  if (showEndNotification) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center min-h-screen w-full z-50"
        style={{
          background: "linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)",
        }}
      >
        <header style={headerStyle} className="sticky top-0 z-10 w-full bg-transparent">
          <div className="flex items-center justify-between px-4 pt-4">
            <button
              onClick={handleCloseEndNotification}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
          </div>
        </header>

        {/* Nội dung thông báo căn giữa dọc */}
        <div className="flex flex-col items-center justify-center flex-1 mt-0">
          <div className="text-white text-2xl font-semibold">{contactName}</div>
          <div className="flex flex-col items-center gap-2 mt-1">
            <div className="text-white/90 text-lg font-normal tracking-wide">
              Call ended
            </div>
            <div className="flex items-center justify-center gap-2">
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
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Video Layout 50/50 */}
      <div className="relative w-full h-full">
        {/* Top Video */}
        <div className="absolute top-0 left-0 w-full h-1/2 p-2">
          <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-900">
            <video
              ref={isLocalOnTop ? localVideoRef : remoteVideoRef}
              autoPlay
              playsInline
              muted={isLocalOnTop}
              className="w-full h-full object-cover"
              style={{
                transform: isLocalOnTop ? "scaleX(-1)" : "none"
              }}
            />


            {/* Icon camera off nếu cần */}
            {(!cameraOn && isLocalOnTop) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="flex flex-col items-center gap-2">
                  <VideoOff className="w-12 h-12 text-white/60" />
                  <span className="text-white/60 text-sm">Camera is off</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Video */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 p-2">
          <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-900">
            <video
              ref={isLocalOnTop ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!isLocalOnTop}
              className="w-full h-full object-cover"
              style={{
                transform: !isLocalOnTop ? "scaleX(-1)" : "none"
              }}
            />
            {/* Icon camera off nếu cần */}
            {(!cameraOn && !isLocalOnTop) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="flex flex-col items-center gap-2">
                  <VideoOff className="w-12 h-12 text-white/60" />
                  <span className="text-white/60 text-sm">Camera is off</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Handle - Ở giữa 2 khung hình */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div
            onClick={handleSwapLayout}
            className="w-20 h-10 rounded-full bg-gray-400/30 backdrop-blur-md border border-white/30 flex items-center justify-center shadow transition-all duration-200 cursor-pointer"
            aria-label="Drag to swap camera positions"
          >
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
              {/* Dấu ^ phía trên, hở nhau ở giữa */}
              <polyline
                points="10,14 20,7 30,14"
                stroke="#545353"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dấu v phía dưới, hở nhau ở giữa */}
              <polyline
                points="10,20 20,27 30,20"
                stroke="#545353"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Header */}
      <header style={headerStyle} className="absolute top-0 z-30 w-full bg-transparent">
        <div className="flex flex-col items-center pt-6">
          <div className="flex items-center justify-between w-full px-4 relative">
            <button
              onClick={showEndNotification ? handleCloseEndNotification : undefined}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
            {/* Camera toggle - giống VoiceCall */}
            <button
              onClick={handleToggleCamera}
              className={`
                relative flex items-center
                w-14 h-8 rounded-full
                bg-white/20 backdrop-blur-md border border-white/30 shadow
                transition-colors
                px-1
              `}
              aria-label="Toggle camera"
            >
              <span
                className={`
                  flex items-center justify-center
                  w-6 h-6 rounded-full
                  ${cameraOn
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur border-white/30'
                  }
                  transition-colors transition-transform
                  ${cameraOn ? 'translate-x-6' : 'translate-x-0'}
                `}
              >
                <Video className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>
          <div className="mt-2 text-center">
            {isRinging ? (
              <div className="text-white/90 text-lg mt-1 font-normal tracking-wide">
                Requesting ...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-white/80 text-lg font-mono">
                    {formatDuration(callDuration ?? internalDuration)}
                  </span>
                </div>
                {/* Hiện tên người gọi ở dưới đồng hồ */}
                <div className="text-white text-base font-medium mt-1">
                  {contactName}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 w-full z-30">
        {/* Row 1: End Call và Translate */}
        <div className="flex items-start justify-between w-full px-4 mb-6">
          <div className="w-12"></div>

          {/* End Call */}
          <button
            onClick={handleEnd}
            disabled={showEndNotification}
            className="flex flex-col items-center group"
            aria-label="End call"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-disabled:opacity-60">
              <Phone className="w-8 h-8 text-white rotate-[135deg]" />
            </div>
            <span className="mt-1 text-xs text-gray-200 font-medium select-none">
              Kết thúc
            </span>
          </button>

          {/* Translate */}
          <button
            onClick={handleTranslate}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors"
            aria-label="Translate"
          >
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <text x="3" y="20" fontSize="16" fontFamily="Arial" fill="white">
                文
              </text>
              <text x="15" y="24" fontSize="14" fontFamily="Arial" fill="white">
                A
              </text>
            </svg>
          </button>
        </div>

        {/* Panel với nút mũi tên */}
        <div className="pointer-events-auto flex justify-center">
          {toolsOpen ? (
            <div
              className="bg-transparent backdrop-blur-md border border-white/30 rounded-2xl transition-all duration-300 ease-in-out"
              style={{
                boxShadow: "0 12px 32px -8px rgba(255,255,255,0.18)",
              }}
            >
              <div className="flex justify-center px-7 py-1">
                <button
                  onClick={() => setToolsOpen((o) => !o)}
                  className="w-8 h-8 flex items-center justify-center"
                  aria-label="Close tools"
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>
              </div>

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
                    <span className="text-xs text-white/90 font-medium">
                      Thêm nhóm
                    </span>
                  </button>

                  {/* Tắt tiếng - Sử dụng handleToggleSpeaker */}
                  <button
                    onClick={handleToggleSpeaker}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center border border-white/30 transition-colors mb-2 ${isSpeakerOn
                        ? 'bg-gray-500/40 border-gray-400/30'
                        : 'bg-red-500/60 border-red-400/50'
                        }`}
                    >
                      {isSpeakerOn ? (
                        <Volume2 className="w-6 h-6 text-white" />
                      ) : (
                        <VolumeX className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-white/90 font-medium">
                      Tắt tiếng
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setToolsOpen((o) => !o)}
                className="w-8 h-8 flex items-center justify-center"
                aria-label="Open tools"
              >
                <ChevronUp className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}