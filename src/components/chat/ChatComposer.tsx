"use client";

import { useRef, useState, useEffect } from "react";
import {
  CircleEllipsis,
  Eclipse,
  Mic,
  Paperclip,
  Plus,
  Search,
  Smile,
  StopCircle,
} from "lucide-react";
import {
  getImageDimensions,
  sendFileMessage,
  sendImageMessage,
  sendLocationMessage,
  sendMessage,
  sendSticker,
  sendTypingEvent,
  sendVideoMessage,
  sendVoiceMessage,
} from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useTheme } from "next-themes";
import { MessageType, useChatStore } from "@/stores/useChatStore";
import TypingIndicator from "./TypingIndicator";
import useTyping from "@/hooks/useTyping";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import ForwardMsgPreview from "./ForwardMsgPreview";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { useForwardStore } from "@/stores/useForwardStore";
import { Gift, Reply, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {
  getVideoMetadata,
  Metadata,
} from "@/utils/chat/send-message/getVideoMetadata";
import { GrGallery } from "react-icons/gr";
import { FaFile } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { FileInfo, ImageInfo } from "@/types/chat";
import StickerPicker from "@/components/common/StickerPicker";

const ChatComposer = ({ roomId }: { roomId: string }) => {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const client = useMatrixClient();
  const theme = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const { messages: forwardMessages, clearMessages } = useForwardStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<
    "gallery" | "gift" | "file" | "location" | "reply" | "checklist"
  >("gallery");
  const sheetRef = useRef<HTMLDivElement>(null);

  const LocationMap = dynamic(() => import("@/components/common/LocationMap"), {
    ssr: false,
  });

  const MIN_RECORD_TIME = 1; // giây
  const MIN_PRESS_TIME_MS = 300;

  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [recordTime, setRecordTime] = useState(0);

  const recordIntervalRef = useRef<number | null>(null);
  const recordStartRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startRecordingPromiseRef = useRef<Promise<void> | null>(null);
  const pressStartRef = useRef<number | null>(null);
  const recordDurationRef = useRef<number>(0);
  const shouldCancelRecordingRef = useRef<boolean>(false);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useTyping(roomId);
  // Bắt đầu ghi âm
  const startRecording = async () => {
    if (isRecording) return;

    pressStartRef.current = Date.now();
    recordDurationRef.current = 0;
    setIsRecording(true);
    setRecordTime(0);
    recordStartRef.current = Date.now();
    shouldCancelRecordingRef.current = false;

    const promise = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (shouldCancelRecordingRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          return;
        }

        setMediaStream(stream);
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
          const duration = recordDurationRef.current || 0;
          if (chunks.length === 0 || duration < MIN_RECORD_TIME) {
            console.warn("Ghi âm quá ngắn, không gửi");
            setAudioChunks([]);
            setRecordTime(0);
            return;
          }

          // Tạo blob với đúng mimeType và extension
          const blob = new Blob(chunks, { type: mimeType });
          const ext = mimeType.includes("mp4")
            ? ".mp4"
            : mimeType.includes("mpeg")
            ? ".mp3"
            : ".webm";
          const file = new File([blob], `voice_${Date.now()}${ext}`, {
            type: blob.type,
          });

          if (client) {
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

            setAudioChunks([]);
            setRecordTime(0);
            recordDurationRef.current = 0;
            recordStartRef.current = null;
          }
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
    const pressDuration = pressStartRef.current
      ? Date.now() - pressStartRef.current
      : 0;
    pressStartRef.current = null;

    if (pressDuration < MIN_PRESS_TIME_MS) {
      console.warn("Người dùng nhấn quá nhanh, huỷ ghi âm");
      shouldCancelRecordingRef.current = true;

      setIsRecording(false);
      clearRecordingInterval();
      recordDurationRef.current = 0;

      if (startRecordingPromiseRef.current) {
        await startRecordingPromiseRef.current;
      }

      await forceStop();
      return;
    }

    shouldCancelRecordingRef.current = false;

    if (startRecordingPromiseRef.current) {
      await startRecordingPromiseRef.current;
    }

    setIsRecording(false);
    clearRecordingInterval();

    const duration = recordStartRef.current
      ? Math.round((Date.now() - recordStartRef.current) / 1000)
      : 0;
    recordDurationRef.current = duration;
    recordStartRef.current = null;

    await forceStop();
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!client) return;

    const trimmed = text.trim();
    const userId = client.getUserId();
    const now = new Date();

    //  1. Gửi message thường trước nếu có nội dung
    if (trimmed) {
      const localId = "local_" + Date.now();
      //console.log("Local Id: "  + localId)
      addMessage(roomId, {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: trimmed,
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: isOnlyEmojis(trimmed) ? "emoji" : "text",
      });

      setText("");
      textareaRef.current?.focus();
      setShowEmojiPicker(false);
      setIsTyping(false);
      sendTypingEvent(client, roomId, false);

      setTimeout(() => {
        sendMessage(roomId, trimmed, client)
          .then((res) => {
            if (!res.success) console.log("Send Failed!");
          })
          .catch((err) => console.log("Send Error:", err));
      }, 1000);
    }

    //  2. Gửi các forward messages nếu có
    if (forwardMessages.length > 0) {
      forwardMessages.forEach((fwd) => {
        const localId = "local_" + Date.now() + Math.random();
        const forwardBody = JSON.stringify({
          forward: true,
          originalSenderId: fwd.senderId,
          originalSender: fwd.sender,
          text: fwd.text,
        });

        //console.log(forwardMessages);
        addMessage(roomId, {
          eventId: localId,
          sender: userId ?? undefined,
          senderDisplayName: fwd.sender,
          text: forwardBody,
          time: now.toLocaleString(),
          timestamp: now.getTime(),
          status: "sent",
          type: "text",
          isForward: true,
        });

        sendMessage(roomId, forwardBody, client);
      });

      clearMessages();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    //console.log(emojiData);
    setText((prev) => prev + emojiData.emoji);
  };

  const handleIconSelect = (emojiData: any) => {
    setShowStickers(false);
    console.log(emojiData);
    if (!client) return;
    const userId = client.getUserId();
    const now = new Date();
    const localId = "local_" + Date.now();
    addMessage(roomId, {
      eventId: localId,
      sender: userId ?? undefined,
      senderDisplayName: userId ?? undefined,
      text: emojiData.emoji,
      time: now.toLocaleString(),
      timestamp: now.getTime(),
      status: "sent",
      type: "emoji",
    });
    setTimeout(() => {
      sendMessage(roomId, emojiData.emoji, client)
        .then((res) => {
          if (!res.success) console.log("Send Failed!");
        })
        .catch((err) => console.log("Send Error:", err));
    }, 1000);
  };

  const handleStickerSelect = async (
    emoji: string,
    isStickerAnimation: boolean
  ) => {
    setShowStickers(false);
    if (!client) return;
    //console.log(emoji);
    try {
      const localId = "local_" + Date.now();
      const userId = client.getUserId();
      const now = new Date();
      addMessage(roomId, {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: emoji,
        isStickerAnimation: isStickerAnimation,
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: "sticker",
      });
      await sendSticker(client, roomId, emoji, isStickerAnimation);
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  const handleImagesAndVideos = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || !client) return;
    setOpen(false);
    const userId = client.getUserId();
    const now = new Date();

    for (const file of Array.from(files)) {
      try {
        const localId = "local_" + Date.now() + Math.random();
        if (file.type.startsWith("image/")) {
          // Lấy kích thước ảnh
          const dimentions = await getImageDimensions(file);
          const imageInfo: ImageInfo = {
            width: dimentions.width,
            height: dimentions.height,
          };

          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: file.name,
            imageUrl: null,
            imageInfo,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: "image",
          });

          const { httpUrl } = await sendImageMessage(client, roomId, file);
          updateMessage(roomId, localId, { imageUrl: httpUrl });
        } else if (file.type.startsWith("video/")) {
          // Gửi video
          const metadata = await getVideoMetadata(file);
          const videoInfo: Metadata = {
            width: metadata.width,
            height: metadata.height,
            duration: metadata.duration,
          };
          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: file.name,
            videoUrl: null,
            videoInfo,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: "video",
          });

          const { httpUrl } = await sendVideoMessage(client, roomId, file);
          updateMessage(roomId, localId, {
            videoUrl: httpUrl,
          });
        }
      } catch (err) {
        console.error("Failed to send image:", err);
      }
    }
    e.target.value = ""; // reset input
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (client && roomId) {
        sendTypingEvent(client, roomId, false);
      }
    };
  }, [client, roomId]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + "px"; // max 3 dòng

      setIsMultiLine(textarea.scrollHeight > 48); // 2 dòng trở lên
    }
  }, [text]);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingEvent(client, roomId, true);
    }

    // Reset debounce timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingEvent(client, roomId, false); // Dừng typing sau 3s không gõ
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  function TabButton({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center hover:text-black"
      >
        {icon}
        {label}
      </button>
    );
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderIcon = (tab: string) => {
    switch (tab) {
      case "gallery":
        return <CircleEllipsis className="mx-4" />;
      case "location":
        return <Search className="mx-4" />;
      default:
        return <div className="w-18 h-9"></div>;
    }
  };

  const handleSendLocation = async (location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    if (!client) return;
    const userId = client.getUserId();
    try {
      setOpen(false);
      const localId = "local_" + Date.now();
      const now = new Date();
      const { latitude, longitude, accuracy } = location;
      const geoUri = `geo:${latitude},${longitude};u=${accuracy}`;
      const displayText = `📍 My location (accurate to ${Math.round(
        accuracy
      )}m)`;

      addMessage(roomId, {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: displayText,
        location: {
          latitude,
          longitude,
          description: displayText ?? undefined,
        },
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: "location",
      });

      const res = await sendLocationMessage(client, roomId, {
        geoUri,
        displayText,
      });

      if (res.success) {
        console.log("Send Location Message successfully");
      }
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  const handleSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !client) return;
    setOpen(false);
    const userId = client.getUserId();
    for (const file of Array.from(files)) {
      try {
        let httpUrlImage: string | null = null;
        let httpUrlVideo: string | null = null;
        let metadata: Metadata | null = null;
        let httpUrlFile: string | null = null;
        let fileInfo: FileInfo | null = null;
        const contentType = file.type;
        let type: MessageType = "file"; // Mặc định
        const localId = "local_" + Date.now() + Math.random();
        const now = new Date();

        if (contentType.startsWith("image/")) {
          type = "image";
          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: file.name,
            imageUrl: httpUrlImage,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: type,
          });
          const res = await sendImageMessage(client, roomId, file);
          httpUrlImage = res.httpUrl;
          updateMessage(roomId, localId, { imageUrl: httpUrlImage });
        } else if (contentType.startsWith("video/")) {
          type = "video";
          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: file.name,
            videoUrl: httpUrlVideo,
            videoInfo: metadata,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: type,
          });
          const res = await sendVideoMessage(client, roomId, file);
          httpUrlVideo = res.httpUrl;
          metadata = res.metadata;
          updateMessage(roomId, localId, {
            videoUrl: httpUrlVideo,
            videoInfo: metadata,
          });
        } else {
          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: file.name,
            fileUrl: httpUrlFile,
            fileInfo: fileInfo,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: type,
          });
          const res = await sendFileMessage(client, roomId, file);
          httpUrlFile = res.httpUrl;
          fileInfo = { fileSize: file.size, mimeType: file.type };
          updateMessage(roomId, localId, {
            fileUrl: httpUrlFile,
            fileInfo: fileInfo,
          });
        }
        console.log("Type File: " + type);
      } catch (error) {
        console.error("Failed to send file:", error);
      }
    }
  };

  // Detect keyboard open with improved Safari iOS support
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Improved mobile detection
    const isMobile = () => {
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        (navigator.maxTouchPoints &&
          navigator.maxTouchPoints > 2 &&
          /MacIntel/.test(navigator.platform)) || // iPad with iPadOS 13+
        window.matchMedia("(pointer: coarse)").matches
      );
    };

    // Store initial viewport height for better comparison
    const initialViewportHeight = window.innerHeight;
    const isIOSSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    const onResize = () => {
      if (!isMobile()) return;

      const currentHeight = window.innerHeight;
      const visualHeight = window.visualViewport?.height ?? currentHeight;

      // Different thresholds for different browsers
      const threshold = isIOSSafari ? 150 : 100;
      const heightDiff = initialViewportHeight - visualHeight;

      // For iOS Safari, also check window.innerHeight changes
      const windowHeightDiff = initialViewportHeight - currentHeight;
      const effectiveDiff = Math.max(heightDiff, windowHeightDiff);

      // console.log("Keyboard detection:", {
      //   initialHeight: initialViewportHeight,
      //   currentHeight,
      //   visualHeight,
      //   effectiveDiff,
      //   threshold,
      //   isIOSSafari,
      // });

      if (effectiveDiff > threshold) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    // Alternative approach for Safari iOS using focus/blur events
    const onInputFocus = () => {
      if (isIOSSafari) {
        setTimeout(() => setIsKeyboardOpen(true), 300);
      }
    };

    const onInputBlur = () => {
      if (isIOSSafari) {
        setTimeout(() => setIsKeyboardOpen(false), 300);
      }
    };

    // Multiple event listeners for better Safari iOS support
    const events = ["resize", "orientationchange"];

    // Add visualViewport listeners if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }

    // Add window event listeners as fallback and for iOS Safari
    events.forEach((event) => {
      window.addEventListener(event, onResize);
    });

    // Add focus/blur listeners for input elements (Safari iOS fallback)
    if (textareaRef.current) {
      textareaRef.current.addEventListener("focus", onInputFocus);
      textareaRef.current.addEventListener("blur", onInputBlur);
    }

    // Initial check
    onResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onResize);
        window.visualViewport.removeEventListener("scroll", onResize);
      }

      events.forEach((event) => {
        window.removeEventListener(event, onResize);
      });

      if (textareaRef.current) {
        textareaRef.current.removeEventListener("focus", onInputFocus);
        textareaRef.current.removeEventListener("blur", onInputBlur);
      }
    };
  }, []);

  return (
    // <div className="bg-[#e0ece6] dark:bg-[#1b1a1f]">
    //   {forwardMessages.length > 0 && <ForwardMsgPreview />}
    //   {isRecording && (
    //     <div className="px-4 py-2">
    //       <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
    //         <div
    //           className="h-full bg-red-500"
    //           style={{ width: `${Math.min((recordTime / 60) * 100, 100)}%` }}
    //         />
    //       </div>
    //       <div className="text-sm text-gray-600 mt-1">{recordTime}s</div>
    //     </div>
    //   )}

    //   <div
    //     className={`relative flex justify-between items-center px-2 py-2 lg:py-3 transition-all duration-300 ${
    //       isKeyboardOpen ? "pb-2" : "pb-10"
    //     }`}
    //   >
    //     <Paperclip
    //       // onClick={() => inputRef.current?.click()}
    //       onClick={() => setOpen(true)}
    //       className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
    //       size={25}
    //     />
    //     <div
    //       className={`p-1 mx-1.5 relative ${
    //         isMultiLine ? "rounded-2xl" : "rounded-full"
    //       } flex items-center justify-between w-full bg-white dark:bg-black`}
    //     >
    //       <textarea
    //         ref={textareaRef}
    //         value={text}
    //         onChange={onInputChange}
    //         onKeyDown={handleKeyDown}
    //         placeholder="Message"
    //         rows={1}
    //         className="flex-1 h-auto resize-none bg-transparent outline-none px-3 max-h-[6rem] overflow-y-auto text-md text-black dark:text-white scrollbar-thin"
    //       />
    //       {text.trim() ? (
    //         <Smile
    //           onClick={() => setShowEmojiPicker((prev) => !prev)}
    //           className="px-0.5 text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
    //           size={24}
    //         />
    //       ) : (
    //         <Eclipse
    //           onClick={() => setShowStickers((prev) => !prev)}
    //           className="px-0.5 text-[#858585] cursor-default"
    //           size={24}
    //         />
    //       )}

    //       {showEmojiPicker && (
    //         <div className="absolute bottom-12 right-2 z-50">
    //           <EmojiPicker
    //             width={300}
    //             height={350}
    //             onEmojiClick={handleEmojiClick}
    //             searchDisabled={true}
    //             previewConfig={{ showPreview: false }}
    //             theme={
    //               theme.theme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT
    //             }
    //           />
    //         </div>
    //       )}
    //       <StickerPicker
    //         isOpen={showStickers}
    //         onClose={() => setShowStickers(false)}
    //         onStickerSelect={handleStickerSelect}
    //         onEmojiSelect={handleIconSelect}
    //       />
    //     </div>

    //     <div className="absolute bottom-14 left-0 z-50 pb-6">
    //       <TypingIndicator roomId={roomId} />
    //     </div>

    //     {text.trim() || forwardMessages.length > 0 ? (
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         viewBox="2 2 20 20"
    //         fill="currentColor"
    //         className="size-8 cursor-pointer hover:scale-110 duration-300 transition-all ease-in-out border-0"
    //         onClick={handleSend}
    //       >
    //         <path
    //           fillRule="evenodd"
    //           d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
    //           clipRule="evenodd"
    //           className="text-blue-600"
    //         />
    //       </svg>
    //     ) : (
    //       /* nút mic nhấn giữ để ghi, thả để gửi */
    //       <Mic
    //         size={30}
    //         className={`text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all duration-700 ${
    //           isRecording ? "text-red-500 scale-125" : ""
    //         }`}
    //         onMouseDown={(e) => {
    //           e.preventDefault(); // tránh double-trigger
    //           startRecording();
    //         }}
    //         onMouseUp={(e) => {
    //           e.preventDefault();
    //           stopRecording();
    //         }}
    //         onMouseLeave={(e) => {
    //           e.preventDefault();
    //           if (isRecording) stopRecording();
    //         }}
    //         onTouchStart={() => {
    //           startRecording();
    //         }}
    //         onTouchEnd={() => {
    //           stopRecording();
    //         }}
    //       />
    //     )}
    //   </div>
    //   <AnimatePresence>
    //     {open && (
    //       <motion.div
    //         initial={{ y: "100%" }}
    //         animate={{ y: 0 }}
    //         exit={{ y: "100%" }}
    //         transition={{ type: "spring", stiffness: 300, damping: 30 }}
    //         className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black rounded-t-2xl shadow-2xl pb-10"
    //         ref={sheetRef}
    //       >
    //         {/* Header */}
    //         <div className="flex items-center justify-between w-full p-2 px-4 font-medium text-gray-600 capitalize">
    //           <Button
    //             variant={"link"}
    //             className="text-blue-500"
    //             onClick={() => setOpen(false)}
    //           >
    //             Close
    //           </Button>
    //           {tab}
    //           {renderIcon(tab)}
    //         </div>

    //         {/* Content */}
    //         <div className="p-2 h-[400px]">
    //           {tab === "gallery" && (
    //             <div className="flex justify-center items-center h-full">
    //               <button
    //                 onClick={() => imageInputRef.current?.click()}
    //                 className="p-2 bg-blue-500 text-white rounded-md"
    //               >
    //                 Chọn ảnh hoặc video
    //               </button>
    //               <input
    //                 ref={imageInputRef}
    //                 type="file"
    //                 accept="image/*,video/*"
    //                 multiple
    //                 onChange={handleImagesAndVideos}
    //                 className="hidden"
    //                 aria-label="file"
    //               />
    //             </div>
    //           )}
    //           {tab === "file" && (
    //             <div className="flex justify-center items-center h-full">
    //               <button
    //                 onClick={() => fileInputRef.current?.click()}
    //                 className="p-2 bg-blue-500 text-white rounded-md"
    //               >
    //                 Chọn file
    //               </button>
    //               <input
    //                 ref={fileInputRef}
    //                 type="file"
    //                 onChange={handleSendFile}
    //                 multiple
    //                 className="hidden"
    //                 aria-label="file"
    //               />
    //             </div>
    //           )}
    //           {tab === "gift" && (
    //             <div className="text-sm text-gray-500">
    //               Danh sách quà tặng...
    //             </div>
    //           )}
    //           {tab === "location" && (
    //             <div className="text-sm text-gray-500">
    //               <LocationMap onSend={handleSendLocation} />
    //             </div>
    //           )}
    //           {tab === "reply" && (
    //             <div className="text-sm text-gray-500">
    //               Chọn tin nhắn để trả lời...
    //             </div>
    //           )}
    //           {tab === "checklist" && (
    //             <div className="text-sm text-gray-500">Thêm checklist...</div>
    //           )}
    //         </div>

    //         {/* Tabs */}
    //         <div className="flex justify-around border-t border-gray-200 px-4 py-2 text-xs text-center text-gray-600">
    //           <TabButton
    //             icon={
    //               <GrGallery
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "gallery" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="Gallery"
    //             onClick={() => setTab("gallery")}
    //           />
    //           {/* <TabButton
    //             icon={
    //               <Gift
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "gift" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="Gift"
    //             onClick={() => setTab("gift")}
    //           /> */}
    //           <TabButton
    //             icon={
    //               <FaFile
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "file" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="File"
    //             onClick={() => setTab("file")}
    //           />
    //           <TabButton
    //             icon={
    //               <MdLocationOn
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "location" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="Location"
    //             onClick={() => setTab("location")}
    //           />
    //           {/* <TabButton
    //             icon={
    //               <Reply
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "reply" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="Reply"
    //             onClick={() => setTab("reply")}
    //           /> */}
    //           {/* <TabButton
    //             icon={
    //               <Check
    //                 className={`w-5 h-5 mb-1 ${
    //                   tab === "checklist" ? "text-blue-500" : ""
    //                 }`}
    //               />
    //             }
    //             label="Checklist"
    //             onClick={() => setTab("checklist")}
    //           /> */}
    //         </div>
    //       </motion.div>
    //     )}
    //   </AnimatePresence>
    // </div>

    <div className="flex mx-3 pb-3">
      {/* Nút Plus ngoài cùng bên trái */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full shadow-sm
  border-white cursor-pointer bg-gradient-to-br from-slate-100/70 
  via-gray-400/10 to-slate-50/30 backdrop-blur-xs bg-white/30
  hover:scale-105 duration-300 transition-all ease-in-out mr-2"
        onClick={() => imageInputRef.current?.click()}
      >
        <Plus className="w-6 h-6" />
        {/* Input file ẩn để chọn ảnh */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleImagesAndVideos}
        />
      </div>

      {/* Khung nhập chat */}
      <div
        className="flex flex-1 items-center px-3 h-12 rounded-3xl bg-white/80 border border-white shadow-sm"
        style={{ minWidth: 0 }} // Đảm bảo không bị overflow ngang
      >
        {/* Icon micro bên trái */}
        <Mic
          className="w-5 h-5 text-gray-400 mr-2 cursor-pointer flex-shrink-0"
          onMouseDown={(e) => {
            e.preventDefault();
            startRecording();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stopRecording();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            if (isRecording) stopRecording();
          }}
          onTouchStart={() => startRecording()}
          onTouchEnd={() => stopRecording()}
        />
        {/* Input nhập tin nhắn */}
        <input
          type="text"
          value={text}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter message"
          className="flex-1 h-full bg-transparent outline-none text-base text-gray-700 placeholder-gray-400
        placeholder:italic placeholder:font-light px-2"
          style={{ minWidth: 0 }}
        />
        {/* Icon smile bên phải */}
        <Smile
          className="w-5 h-5 text-gray-400 ml-2 cursor-pointer flex-shrink-0"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />
        {/* Icon gửi (nếu có text) */}
        {text.trim() && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="2 2 20 20"
            fill="currentColor"
            className="ml-2 w-6 h-6 cursor-pointer hover:scale-110 duration-300 transition-all ease-in-out flex-shrink-0
            animate-in slide-in-from-right-20"
            onClick={handleSend}
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
              clipRule="evenodd"
              className="text-blue-600"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default ChatComposer;
