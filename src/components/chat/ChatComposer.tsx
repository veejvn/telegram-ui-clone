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
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import ReplyPreview from "./ReplyPreview";
import EditMessageInput from "./EditMessageInput";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { useForwardStore } from "@/stores/useForwardStore";
import { useReplyStore } from "@/stores/useReplyStore";
import { useEditStore } from "@/stores/useEditStore";
import { editMessage } from "@/services/chatService";
import { toast } from "sonner";
import { Gift, Reply, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {
  getVideoMetadata,
  Metadata,
} from "@/utils/chat/send-message/getVideoMetadata";
import { GrGallery } from "react-icons/gr";
import { IoFolderOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { MdLocationOn } from "react-icons/md";
import { FileInfo, ImageInfo } from "@/types/chat";
import StickerPicker from "@/components/common/StickerPicker";
import styles from "./page.module.css";
import clsx from "clsx";
import VoiceRecordingModal from "@/components/chat/VoiceRecordingModal";

const ChatComposer = ({ roomId }: { roomId: string }) => {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showModalVoiceRecord, setShowModalVoiceRecord] = useState(false);

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
  const { replyMessage, clearReply } = useReplyStore();
  const { editMessage: editMsg, clearEditMessage, isEditing } = useEditStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"Photo" | "File" | "Location">("Photo");
  const [selectOpen, setSelectOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const voiceModalRef = useRef<HTMLDivElement>(null);

  const LocationMap = dynamic(() => import("@/components/common/LocationMap"), {
    ssr: false,
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useTyping(roomId);

  // Handle edit message - set text khi có editMessage
  useEffect(() => {
    if (editMsg) {
      setText(editMsg.text);
      // Focus vào textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Đặt cursor ở cuối text
          const length = editMsg.text.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
  }, [editMsg]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // Nếu đang edit thì save edit, ngược lại send message mới
      if (isEditing && editMsg) {
        handleEditSave();
      } else {
        // Chỉ clear textarea khi send tin nhắn mới
        if (textareaRef.current) {
          textareaRef.current.value = "";
        }
        handleSend();
      }
    } else if (e.key === "Escape" && isEditing) {
      // Cancel edit khi nhấn Escape
      e.preventDefault();
      handleEditCancel();
    }
  };

  const handleEditSave = async () => {
    if (!editMsg || !client || !text.trim()) return;

    try {
      const result = await editMessage(
        client,
        editMsg.roomId,
        editMsg.eventId,
        text.trim()
      );

      if (result.success) {
        // Cập nhật tin nhắn trong store local
        updateMessage(editMsg.roomId, editMsg.eventId, {
          text: text.trim(),
          isEdited: true,
        });

        // Clear edit state và text
        clearEditMessage();
        setText("");

        // Clear textarea
        if (textareaRef.current) {
          textareaRef.current.value = "";
        }
      } else {
        console.error("Failed to edit message:", result.err);
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleEditCancel = () => {
    clearEditMessage();
    setText("");
  };

  const handleSend = () => {
    if (!client) return;

    const trimmed = text.trim();
    const userId = client.getUserId();
    const now = new Date();

    //  1. Gửi message thường trước nếu có nội dung
    if (trimmed) {
      const localId = "local_" + Date.now();
      let messageBody = trimmed;
      let messageType = isOnlyEmojis(trimmed) ? "emoji" : "text";

      // Nếu có reply, tạo reply body tương tự forward
      if (replyMessage) {
        messageBody = JSON.stringify({
          reply: true,
          text: trimmed,
          replyTo: {
            eventId: replyMessage.eventId,
            text: replyMessage.text,
            sender: replyMessage.sender,
            senderDisplayName: replyMessage.senderDisplayName,
          },
        });
        messageType = "text"; // reply message luôn là text type
      }

      // Tạo message object
      const messageData: any = {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: messageBody,
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: messageType,
        isReply: !!replyMessage, // thêm flag để dễ identify
      };

      addMessage(roomId, messageData);

      setText("");
      textareaRef.current?.focus();
      setShowEmojiPicker(false);
      setIsTyping(false);
      sendTypingEvent(client, roomId, false);

      // Clear reply after sending
      if (replyMessage) {
        clearReply();
      }

      setTimeout(() => {
        sendMessage(roomId, messageBody, client)
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
      const target = e.target as Node;

      // Don't close modal if Select dropdown is open
      if (selectOpen) {
        return;
      }

      // Check if click is on Select dropdown content (which is in a portal)
      const selectContent = document.querySelector(
        "[data-radix-select-content]"
      );
      if (selectContent && selectContent.contains(target)) {
        return; // Don't close modal if clicking on select dropdown
      }

      // Check if click is on Select trigger or value
      const selectTrigger = document.querySelector(
        "[data-radix-select-trigger]"
      );
      if (selectTrigger && selectTrigger.contains(target)) {
        return; // Don't close modal if clicking on select trigger
      }

      if (sheetRef.current && !sheetRef.current.contains(target)) {
        setOpen(false);
      }
      if (voiceModalRef.current && !voiceModalRef.current.contains(target)) {
        setShowModalVoiceRecord(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectOpen]);

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

  const handleCloseVoiceRecordingModal = () => {
    setShowModalVoiceRecord(false);
    // Reset any state related to voice recording if needed
    // For example, reset recording time or clear any temporary data
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
    <>
      {/* Reply Preview */}
      <ReplyPreview />

      {/* Edit Message Input */}
      <EditMessageInput />

      <div className={`flex pb-8 px-3 backdrop-blur-[24px] ${isEditing ? "bg-[#FFFFFF4D]" : ""}`}>
        {/* Nút Plus ngoài cùng bên trái */}
        {!text.trim() && (
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full shadow-sm
  border-white cursor-pointer bg-gradient-to-br from-slate-100/70 
  via-gray-400/10 to-slate-50/30 backdrop-blur-xs bg-white/30
  hover:scale-105 duration-300 transition-all ease-in-out mr-2"
            onClick={() => setOpen(true)}
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
              aria-label="file"
            />
          </div>
        )}

        {/* Khung nhập chat */}
        <div className="flex flex-1 items-center px-3 h-12 rounded-3xl bg-white/80 border border-white shadow-sm min-w-0">
          {/* Icon micro bên trái */}
          <Mic
            className="w-5 h-5 text-gray-400 mr-2 cursor-pointer flex-shrink-0"
            onClick={() => {
              setShowModalVoiceRecord(true);
            }}
          />
          {/* Input nhập tin nhắn */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter message"
            className="flex-1 h-full bg-transparent outline-none text-[12px] text-gray-700 placeholder-gray-400
        placeholder:italic placeholder:font-light px-2 resize-none mt-5"
          />
          {/* Icon smile bên phải */}
          <Smile
            className="w-5 h-5 text-gray-400 ml-2 cursor-pointer flex-shrink-0"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
          {/* Icon gửi (nếu có text) */}

          {showEmojiPicker && (
            <div className="absolute bottom-22 right-2 z-50">
              <EmojiPicker
                width={300}
                height={350}
                onEmojiClick={handleEmojiClick}
                searchDisabled={true}
                previewConfig={{ showPreview: false }}
                theme={
                  theme.theme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT
                }
              />
            </div>
          )}
        </div>
        <div className="flex items-center">
          {text.trim() && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="2 2 20 20"
              fill="currentColor"
              className="ml-2 size-10 cursor-pointer hover:scale-110 duration-300 transition-all ease-in-out flex-shrink-0
                  animate-in slide-in-from-right-20"
              onClick={isEditing ? handleEditSave : handleSend}
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

        {/* Voice Recording Modal */}
        <VoiceRecordingModal
          isOpen={showModalVoiceRecord}
          client={client}
          roomId={roomId}
          onClose={handleCloseVoiceRecordingModal}
          voiceModalRef={voiceModalRef}
        />

        {/* Send Options Model */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF4D] dark:bg-[#FFFFFF4D] backdrop-blur-[48px] rounded-t-[36px] shadow-2xl"
              ref={sheetRef}
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full p-2 px-4 font-medium text-gray-600 capitalize">
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={tab.toLowerCase()}
                    onValueChange={(value) => {
                      if (value === "photo") setTab("Photo");
                      else if (value === "file") setTab("File");
                      else if (value === "location") setTab("Location");
                    }}
                    onOpenChange={setSelectOpen}
                  >
                    <SelectTrigger
                      className="text-xs rounded-4xl bg-[#FFFFFF4D] border-none text-blue-500"
                      data-radix-select-trigger
                    >
                      <SelectValue>{tab}</SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className="w-[180px] rounded-3xl divide- [&_[data-radix-select-item-indicator]]:!hidden [&_span[data-radix-select-item-indicator]]:!hidden"
                      data-radix-select-content
                    >
                      <SelectItem
                        value="photo"
                        className="flex items-center justify-between w-full cursor-pointer text-[12px]"
                        style={{
                          color: tab === "Photo" ? "#3b82f6" : "#374151",
                          backgroundColor:
                            tab === "Photo" ? "#eff6ff" : "transparent",
                          fontWeight: tab === "Photo" ? "500" : "400",
                        }}
                      >
                        <span className="flex-1">Photo</span>
                        <GrGallery
                          style={{
                            color: tab === "Photo" ? "#3b82f6" : "#374151",
                            flexShrink: 0,
                          }}
                        />
                      </SelectItem>
                      <SelectItem
                        value="file"
                        className="flex items-center justify-between w-full cursor-pointer text-[12px] [&_span[data-radix-select-item-indicator]]:!hidden"
                        style={{
                          color: tab === "File" ? "#3b82f6" : "#374151",
                          backgroundColor:
                            tab === "File" ? "#eff6ff" : "transparent",
                          fontWeight: tab === "File" ? "500" : "400",
                        }}
                      >
                        File
                        <IoFolderOutline
                          className={`w-5 h-5 mb-1 ${
                            tab === "File" ? "text-blue-500" : ""
                          }`}
                        />
                      </SelectItem>
                      <SelectItem
                        value="location"
                        className="flex items-center justify-between w-full cursor-pointer text-[12px] [&_span[data-radix-select-item-indicator]]:!hidden"
                        style={{
                          color: tab === "Location" ? "#3b82f6" : "#374151",
                          backgroundColor:
                            tab === "Location" ? "#eff6ff" : "transparent",
                          fontWeight: tab === "Location" ? "500" : "400",
                        }}
                      >
                        Location
                        <CiLocationOn
                          className={`w-5 h-5 mb-1 ${
                            tab === "Location" ? "text-blue-500" : ""
                          }`}
                        />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant={"link"}
                  className="size-8 bg-[#8080804D] rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-2 h-[500px]">
                {tab === "Photo" && (
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 bg-blue-500 text-white rounded-md"
                    >
                      Chọn ảnh hoặc video
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleImagesAndVideos}
                      className="hidden"
                      aria-label="file"
                    />
                  </div>
                )}
                {tab === "File" && (
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-blue-500 text-white rounded-md"
                    >
                      Chọn file
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleSendFile}
                      multiple
                      className="hidden"
                      aria-label="file"
                    />
                  </div>
                )}
                {tab === "Location" && (
                  <div className="h-full overflow-y-auto">
                    <div className="mb-4">
                      <div className="rounded-2xl overflow-hidden relative">
                        <LocationMap onSend={handleSendLocation} />
                      </div>
                    </div>
                    {/* <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-500 font-semibold">
                          Share my current location
                        </div>
                        <div className="text-gray-500 text-sm">
                          Accurate to 10 metres
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-green-600 font-semibold">
                          Share my live location
                        </div>
                        <div className="text-gray-500 text-sm">
                          Update in real time as you move
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div> */}

                    {/* <div className="mt-6">
                    <h3 className="text-gray-600 font-medium mb-3">
                      Locations near you
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            LaLaLa Restaurant
                          </div>
                          <div className="text-gray-500 text-sm">
                            2601 Avenue, Manhattan, New York, USA
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M2,21V19H20V21H2M20,8V5L18,5V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            LaLaLa Coffee
                          </div>
                          <div className="text-gray-500 text-sm">
                            1258 2nd Avenue, Manhattan, New York, USA
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V7H10V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H8V10A1,1 0 0,0 9,11A1,1 0 0,0 10,10V9H14V10A1,1 0 0,0 15,11A1,1 0 0,0 16,10V9H18V19Z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            Rolland Market
                          </div>
                          <div className="text-gray-500 text-sm">
                            1258 2nd Avenue, Manhattan, New York, USA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  </div>
                )}
              </div>

              {/* Tabs */}
              {/* <div className="flex justify-around border-t border-gray-200 px-4 py-2 text-xs text-center text-gray-600">
              <TabButton
                icon={
                  <GrGallery
                    className={`w-5 h-5 mb-1 ${
                      tab === "Photo" ? "text-blue-500" : ""
                    }`}
                  />
                }
                label="Gallery"
                onClick={() => setTab("Photo")}
              />
              <TabButton
                icon={
                  <FaFile
                    className={`w-5 h-5 mb-1 ${
                      tab === "File" ? "text-blue-500" : ""
                    }`}
                  />
                }
                label="File"
                onClick={() => setTab("File")}
              />
              <TabButton
                icon={
                  <MdLocationOn
                    className={`w-5 h-5 mb-1 ${
                      tab === "Location" ? "text-blue-500" : ""
                    }`}
                  />
                }
                label="Location"
                onClick={() => setTab("Location")}
              />
            </div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChatComposer;
