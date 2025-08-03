import { sendVoiceMessage } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  Info,
  Trash2,
  Play,
  Pause,
  Send,
  MoveRight,
} from "lucide-react";
import { MatrixClient } from "matrix-js-sdk";
import { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Fill } from "react-icons/ri";
import styles from "./VoiceRecordingModal.module.css";
import { FaPlay } from "react-icons/fa";
import { IoPause } from "react-icons/io5";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  voiceModalRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  client: MatrixClient | null;
  roomId: string;
}

export default function VoiceRecordingModal({
  isOpen,
  voiceModalRef,
  onClose,
  client,
  roomId,
}: VoiceRecordingModalProps) {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);

  const [recordTime, setRecordTime] = useState(0);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [progressWidth, setProgressWidth] = useState(0);

  const MIN_RECORD_TIME = 1; // giây

  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

  const recordIntervalRef = useRef<number | null>(null);
  const recordStartRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startRecordingPromiseRef = useRef<Promise<void> | null>(null);
  const pressStartRef = useRef<number | null>(null);
  const recordDurationRef = useRef<number>(0);
  const shouldCancelRecordingRef = useRef<boolean>(false);

  // Xin quyền sử dụng microphone
  const requestMicrophonePermission = async () => {
    if (hasPermission || isRequestingPermission) return;
    
    setIsRequestingPermission(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      
      // Có quyền rồi, lưu stream và set state
      setMediaStream(stream);
      setHasPermission(true);
      setIsRequestingPermission(false);
      
      console.log("Microphone permission granted");
    } catch (err) {
      console.error("Không thể truy cập micro:", err);
      setIsRequestingPermission(false);
      setHasPermission(false);
      
      // Hiển thị thông báo cho user
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert('Vui lòng cho phép truy cập microphone để sử dụng tính năng ghi âm');
      }
    }
  };

  // Bắt đầu ghi âm
  const startRecording = async () => {
    if (isRecording) return;

    // Kiểm tra quyền microphone trước
    if (!hasPermission) {
      await requestMicrophonePermission();
      return; // Không ghi âm ngay, user phải bấm lại
    }

    // Có quyền rồi, bắt đầu ghi âm thật
    pressStartRef.current = Date.now();
    recordDurationRef.current = 0;
    setIsRecording(true);
    setRecordTime(0);
    recordStartRef.current = Date.now();
    shouldCancelRecordingRef.current = false;

    const promise = (async () => {
      try {
        // Sử dụng stream đã có từ requestMicrophonePermission
        const stream = mediaStream || await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        
        if (shouldCancelRecordingRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          return;
        }

        if (!mediaStream) {
          setMediaStream(stream);
        }
        // 1️⃣ Chọn mimeType hỗ trợ trên trình duyệt
        const supported = [
          "audio/webm;codecs=opus",
          "audio/mp4",
          "audio/aac",
          "audio/mpeg",
        ];
        const mimeType = supported.find((t) =>
          MediaRecorder.isTypeSupported?.(t)
        );
        if (!mimeType) {
          console.warn("Recording không được hỗ trợ trên trình duyệt này");
          setIsRecording(false);
          return;
        }

        // 2️⃣ Khởi tạo MediaRecorder với mimeType
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = mediaRecorder;
        setRecorder(mediaRecorder);

        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        setAudioChunks(chunks);

        mediaRecorder.onstop = async () => {
          // Calculate duration from start time
          const duration = recordStartRef.current
            ? Math.round((Date.now() - recordStartRef.current) / 1000)
            : 0;

          // Reset recordStartRef after calculating duration
          recordStartRef.current = null;

          // Update the ref with the actual duration
          recordDurationRef.current = duration;

          console.log(
            `Recording stopped. Duration: ${duration}s, Chunks: ${chunks.length}`
          );

          if (chunks.length === 0 || duration < MIN_RECORD_TIME) {
            console.warn(`Ghi âm quá ngắn (${duration}s), không gửi`);
            // Reset states properly when recording is too short
            setAudioChunks([]);
            setRecordTime(0);
            setIsRecording(false);
            setIsRecordingComplete(false);
            clearRecordingInterval();

            // Stop and clean up media stream
            if (mediaStream) {
              mediaStream.getTracks().forEach((track) => track.stop());
              setMediaStream(null);
            }

            // Reset recorder
            recorderRef.current = null;
            setRecorder(null);
            return;
          }

          // Tạo blob với đúng mimeType và extension
          const blob = new Blob(chunks, { type: mimeType });
          setAudioBlob(blob);

          // Tạo URL để play audio
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // Chuyển sang trạng thái preview
          setIsRecordingComplete(true);
          setIsRecording(false);
          clearRecordingInterval();
        };

        mediaRecorder.start();

        recordIntervalRef.current = window.setInterval(() => {
          if (recordStartRef.current) {
            const duration = Math.round(
              (Date.now() - recordStartRef.current) / 1000
            );
            recordDurationRef.current = duration;
            setRecordTime(duration);
          }
        }, 200);

        if (shouldCancelRecordingRef.current) {
          console.warn("Bị huỷ khi vừa bắt đầu, stop ngay.");
          await stopRecording();
        }
      } catch (err) {
        console.error("Không thể truy cập micro:", err);
        setIsRecording(false);
      }
    })();

    startRecordingPromiseRef.current = promise;
    await promise;
  };

  const stopRecording = async () => {
    shouldCancelRecordingRef.current = false;

    if (startRecordingPromiseRef.current) {
      await startRecordingPromiseRef.current;
    }

    // Calculate duration but don't reset recordStartRef yet - onstop needs it
    const duration = recordStartRef.current
      ? Math.round((Date.now() - recordStartRef.current) / 1000)
      : 0;
    recordDurationRef.current = duration;

    // Don't reset recordStartRef here - let onstop handle it
    // recordStartRef.current = null;

    // Stop the recorder - this will trigger onstop event
    const activeRecorder = recorderRef.current;
    if (activeRecorder && activeRecorder.state === "recording") {
      activeRecorder.stop();
    }

    // Stop microphone stream to turn off mic
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const clearRecordingInterval = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
  };

  const forceStop = async () => {
    const activeRecorder = recorderRef.current;
    if (activeRecorder && activeRecorder.state === "recording") {
      activeRecorder.stop();
    }
    recorderRef.current = null;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSendVoice = async () => {
    if (!audioBlob || !client) return;

    const duration = recordDurationRef.current;
    const mimeType = audioBlob.type;
    const ext = mimeType.includes("mp4")
      ? ".mp4"
      : mimeType.includes("mpeg")
      ? ".mp3"
      : ".webm";
    const file = new File([audioBlob], `voice_${Date.now()}${ext}`, {
      type: mimeType,
    });

    try {
      const localId = "local_" + Date.now();
      const now = new Date();
      const userId = client.getUserId();

      addMessage(roomId, {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: file.name,
        audioUrl: null,
        audioDuration: duration,
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: "audio",
      });

      const { httpUrl } = await sendVoiceMessage(
        client,
        roomId,
        file,
        duration
      );
      updateMessage(roomId, localId, { audioUrl: httpUrl });

      // Reset states and close modal
      resetStates();
      onClose();
    } catch (error) {
      console.error("Failed to send voice message:", error);
    }
  };

  const resetStates = () => {
    setRecordTime(0);
    setPlayTime(0);
    setIsRecordingComplete(false);
    setIsPlaying(false);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioChunks([]);
    recordDurationRef.current = 0;

    // Stop microphone stream if still active
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    // Stop recorder if still active
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setRecorder(null);

    // Reset permission states (keep permission for user experience)
    // setHasPermission(false);
    setIsRequestingPermission(false);
  };

  const handleDelete = () => {
    shouldCancelRecordingRef.current = true;
    setIsRecording(false);
    clearRecordingInterval();
    forceStop();
    resetStates();
    onClose();
  };

  // Update progress width when playTime changes
  useEffect(() => {
    if (recordDurationRef.current > 0) {
      const newWidth = Math.min(
        (playTime / recordDurationRef.current) * 100,
        100
      );
      // Round to nearest 10 for CSS classes
      const roundedWidth = Math.round(newWidth / 10) * 10;
      setProgressWidth(roundedWidth);
    } else {
      setProgressWidth(0);
    }
  }, [playTime]);

  // Setup audio element events
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setPlayTime(Math.floor(audioRef.current.currentTime));
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setPlayTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Cleanup effect when modal closes or component unmounts
  useEffect(() => {
    return () => {
      // Stop recording and mic when modal closes
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      clearRecordingInterval();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-white/70 backdrop-blur-[48px] rounded-t-[36px] h-[223px] shadow-2xl pb-6"
          ref={voiceModalRef}
        >
          {/* Content */}
          <div className="px-8">
            {!isRecordingComplete ? (
              /* Recording State */
              <>
                {/* Timer */}
                <div className="text-center mt-2">
                  <div className="text-[#FF434E] text-[14px] font-medium">
                    {String(Math.floor(recordTime / 60)).padStart(2, "0")}:
                    {String(Math.floor(recordTime / 60)).padStart(2, "0")}:
                    {String(Math.floor(recordTime % 60)).padStart(2, "0")}
                  </div>
                </div>

                {/* Audio Visualizer */}
                <div className="flex items-end justify-center gap-1 mt-4 mb-2 h-4">
                  {[...Array(12)].map((_, i) => {
                    // Calculate if this bar should be active based on recording progress
                    const progressRatio =
                      recordTime > 0 ? Math.min(recordTime / 10, 1) : 0; // 10 seconds to fill all bars
                    const activeBarCount = Math.floor(progressRatio * 12);
                    const isActive = i < activeBarCount;

                    return (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-full ${
                          isRecording && isActive
                            ? "bg-[#FF434E]"
                            : "bg-gray-300"
                        }`}
                        animate={
                          isRecording && isActive
                            ? {
                                height: [2, Math.random() * 30 + 2, 2],
                              }
                            : {
                                height: 2,
                              }
                        }
                        transition={{
                          duration: 0.5,
                          repeat: isRecording && isActive ? Infinity : 0,
                          delay: i * 0.1,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-8 mb-3">
                  {/* Delete Button */}
                  <button
                    onClick={handleDelete}
                    aria-label="Delete recording"
                    className="size-12 flex items-center justify-center"
                  >
                    <RiDeleteBin6Fill className="text-[#FF434E] size-6" />
                  </button>

                  {/* Record Button */}
                  <button
                    aria-label="Recording voice message"
                    className="size-16 bg-[#FF434E] rounded-full border-[5px] border-white"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      startRecording();
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      if (isRecording) {
                        stopRecording();
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      if (isRecording) stopRecording();
                    }}
                    onTouchStart={() => {
                      startRecording();
                    }}
                    onTouchEnd={() => {
                      if (isRecording) {
                        stopRecording();
                      }
                    }}
                  ></button>

                  {/* Send Button */}
                  <button
                    aria-label="Send recording"
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                  >
                    <AudioLines className="text-[#026AE0] size-6" />
                  </button>
                </div>
              </>
            ) : (
              /* Preview State */
              <>
                {/* Header with Delete and Close buttons */}
                <div className="flex justify-between items-center mb-6 pt-4">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-[#FF434E] text-sm font-medium"
                  >
                    <RiDeleteBin6Fill className="size-4" />
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gray-300/50 flex items-center justify-center"
                  >
                    <span className="text-gray-600 text-lg">×</span>
                  </button>
                </div>

                <div className="flex justify-between mb-5">
                  {/* Audio Waveform Visualization */}
                  <div className="flex items-end justify-center gap-1 mt-4 mb-2 h-4">
                    {[...Array(12)].map((_, i) => {
                      const isActive =
                        i <
                        Math.floor((playTime / recordDurationRef.current) * 12);

                      // Generate consistent height for each bar based on index
                      const barHeight = 2 + (Math.sin(i * 0.7) * 6 + 6); // Height between 2-14px

                      return (
                        <motion.div
                          key={i}
                          className={`w-1 rounded-full ${
                            isActive ? "bg-[#026AE0]" : "bg-gray-300"
                          }`}
                          animate={
                            isActive
                              ? {
                                  height: isPlaying
                                    ? [
                                        barHeight,
                                        barHeight + Math.random() * 6,
                                        barHeight,
                                      ]
                                    : barHeight,
                                }
                              : {
                                  height: 2,
                                }
                          }
                          transition={{
                            duration: 0.5,
                            repeat: isActive && isPlaying ? Infinity : 0,
                            delay: i * 0.1,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Timer */}
                  <div className="text-right mb-2">
                    <span className="text-sm text-gray-600 font-mono">
                      00:
                      {String(
                        Math.floor(recordDurationRef.current % 60)
                      ).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className={styles.progressContainer}>
                    <div
                      className={`${styles.progressBar} ${
                        styles[`progress${progressWidth}`]
                      }`}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between gap-16">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                    className="w-12 h-12 bg-[#1B1464] rounded-full flex items-center justify-center shadow-lg"
                  >
                    {isPlaying ? (
                      <IoPause className="text-white size-6" />
                    ) : (
                      <FaPlay className="text-white size-6 ml-1" />
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={handleSendVoice}
                    aria-label="Send voice message"
                    className="w-12 h-12 bg-[#026AE0] rounded-full flex items-center justify-center shadow-lg"
                  >
                    <MoveRight className="text-white size-5" />
                  </button>
                </div>
              </>
            )}

            {/* Instruction Text - Only show during recording */}
            {!isRecordingComplete && (
              <div className="text-center bg-[#FFFFFF4D] w-[220] h-[36] rounded-[100px] border border-[#FFFFFF66] bordet-[#FFFFFF4D] flex items-center justify-center gap-[6px] mx-auto roudned-full">
                <Info className="size-[13.5px]" />
                <p className="text-[#A3A3A3] text-[13px] px-0">
                  Press and hold to record voice
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
