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
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis";
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
import ForwardContactsList from "@/components/chat/ForwardContactsList";
import { useKeyboardDetect } from "@/hooks/useKeyboardDetect";
import { useSendHandlers } from "@/hooks/useSendHandlers";
import AttachmentSheet from "@/components/chat/AttachmentSheet";

const ChatComposer = ({ roomId }: { roomId: string }) => {
  // Animation timing constant for synchronization
  const ANIMATION_DURATION = 0.4;

  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showModalVoiceRecord, setShowModalVoiceRecord] = useState(false);
  // State để kiểm soát quá trình exit animation của nút gửi
  const [isSendButtonAnimating, setIsSendButtonAnimating] = useState(false);
  const [showForwardContacts, setShowForwardContacts] = useState(false);

  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const client = useMatrixClient();
  const theme = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const {
    messages: forwardMessages,
    clearMessages,
    roomIds: forwardRoomIds,
    clearRooms,
  } = useForwardStore();
  const { replyMessage, clearReply } = useReplyStore();
  const { editMessage: editMsg, clearEditMessage, isEditing } = useEditStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"Photo" | "File" | "Location">("Photo");
  const [selectOpen, setSelectOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const voiceModalRef = useRef<HTMLDivElement>(null);

  const isKeyboardOpen = useKeyboardDetect(textareaRef);

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

  // Auto show forward contacts list when forward messages exist
  useEffect(() => {
    setShowForwardContacts(forwardMessages.length > 0);
  }, [forwardMessages]);

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
    // Clear textarea
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!client) return;

    const trimmed = text.trim();
    const userId = client.getUserId();
    const now = new Date();

    // Nếu có forward messages và có rooms được chọn, chỉ gửi forward
    if (forwardMessages.length > 0 && forwardRoomIds.length > 0) {
      // Send additional message first if provided
      if (trimmed) {
        for (const targetRoomId of forwardRoomIds) {
          const localId = `local_${now.getTime()}_${targetRoomId}_text`;

          addMessage(targetRoomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: trimmed,
            time: now.toLocaleString(),
            timestamp: now.getTime(),
            status: "sent",
            type: isOnlyEmojis(trimmed) ? "emoji" : "text",
          });

          setTimeout(() => {
            sendMessage(targetRoomId, trimmed, client)
              .then((res) => {
                if (!res.success) console.log("Send Failed!");
              })
              .catch((err) => console.log("Send Error:", err));
          }, 1000);
        }
      }

      // Send forward messages to selected rooms
      forwardMessages.forEach((fwd) => {
        for (const targetRoomId of forwardRoomIds) {
          const localId = `local_${now.getTime()}_${targetRoomId}_${Math.random()}`;
          const forwardBody = JSON.stringify({
            forward: true,
            originalSenderId: fwd.senderId,
            originalSender: fwd.sender,
            text: fwd.text,
          });

          addMessage(targetRoomId, {
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

          setTimeout(() => {
            sendMessage(targetRoomId, forwardBody, client)
              .then((res) => {
                if (!res.success) console.log("Send Failed!");
              })
              .catch((err) => console.log("Send Error:", err));
          }, 1000);
        }
      });

      // Clear forward data after sending
      clearMessages();
      clearRooms();
      setShowForwardContacts(false);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }

      // Show success message
      toast.success(
        `Message forwarded to ${forwardRoomIds.length} chat${forwardRoomIds.length > 1 ? "s" : ""
        }`
      );
      return;
    }

    //  Gửi message thường nếu không có forward
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

  const {
    handleImagesAndVideos,
    handleSendLocation,
    handleSendFile,
    handleStickerSelect,
  } = useSendHandlers({
    roomId,
    client: client || null,
    setOpen,
    setShowStickers,
  });

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


  const handleCloseVoiceRecordingModal = () => {
    setShowModalVoiceRecord(false);
    // Reset any state related to voice recording if needed
    // For example, reset recording time or clear any temporary data
  };



  return (
    <>
      {/* Reply Preview */}
      <ReplyPreview />

      {/* Edit Message Input */}
      <EditMessageInput onCancel={handleEditCancel} />

      {/* Forward Contacts List */}
      <ForwardContactsList
        isVisible={showForwardContacts}
        onClose={() => {
          setShowForwardContacts(false);
          clearMessages(); // Clear forward messages when closing
        }}
      />

      <div
        className={
          showForwardContacts
            ? "pt-5 rounded-t-[36px] bg-[#FFFFFF4D] backdrop-blur-[48px] z-10"
            : ""
        }
      ></div>
      <div
        className={clsx("flex pb-8 px-3", isEditing ? "bg-[#FFFFFF4D]" : "")}
      >
        {/* Nút Plus ngoài cùng bên trái */}
        <AnimatePresence>
          {!isEditing && !showForwardContacts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.2,
              }}
              className="relative size-12 mr-2 flex-shrink-0"
            >
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center rounded-full shadow-sm border-white cursor-pointer bg-gradient-to-br from-slate-100/70 via-gray-400/10 to-slate-50/30 backdrop-blur-xs bg-white/30"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Khung nhập chat với animation layout */}
        <motion.div
          className="flex flex-1 items-center relative"
          animate={{
            width:
              text.trim() || (showForwardContacts && forwardRoomIds.length > 0)
                ? "calc(100% - 50px)"
                : "100%",
            paddingRight:
              text.trim() || (showForwardContacts && forwardRoomIds.length > 0)
                ? 46
                : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        >
          <div
            className={`flex flex-1 items-center px-3 h-12 rounded-3xl bg-white/80 border border-white shadow-sm min-w-0${text.trim() || (showForwardContacts && forwardRoomIds.length > 0)
              ? " mr-3"
              : ""
              }`}
          >
            {/* Icon micro bên trái */}
            <AnimatePresence>
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic
                    className="w-5 h-5 text-gray-400 mr-2 cursor-pointer flex-shrink-0"
                    onClick={() => {
                      setShowModalVoiceRecord(true);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input nhập tin nhắn */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={onInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isEditing ? "Edit your message..." : "Enter message"}
              className="flex-1 h-full bg-transparent outline-none text-[12px] text-gray-700 placeholder-gray-400
        placeholder:italic placeholder:font-light px-2 resize-none mt-5"
            />

            {/* Icon smile bên phải */}
            <AnimatePresence>
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Smile
                    className="w-5 h-5 text-gray-400 ml-2 cursor-pointer flex-shrink-0"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Icon gửi tin nhắn */}
          <AnimatePresence mode="wait">
            {(text.trim() ||
              (showForwardContacts && forwardRoomIds.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 30 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.2,
                  }}
                  className="absolute top-1/2 -translate-y-1/2 bg-[#026AE0] size-11 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                  style={{ pointerEvents: "auto", right: 1 }}
                >
                  <motion.svg
                    initial={{ x: 3, opacity: 0.7 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                    onClick={isEditing ? handleEditSave : handleSend}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      className="text-white"
                    />
                  </motion.svg>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Emoji Picker with fixed position */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15 }}
                className="fixed bottom-22 right-2 z-50"
                style={{ transform: "translate3d(0, 0, 0)" }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Voice Recording Modal */}
        <VoiceRecordingModal
          isOpen={showModalVoiceRecord}
          client={client}
          roomId={roomId}
          onClose={handleCloseVoiceRecordingModal}
          voiceModalRef={voiceModalRef}
        />

        {/* Send Options Model */}
        <AttachmentSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          tab={tab}
          setTab={setTab}
          setSelectOpen={setSelectOpen}
          sheetRef={sheetRef}
          imageInputRef={imageInputRef}
          fileInputRef={fileInputRef}
          onImagesAndVideosChange={handleImagesAndVideos}
          onSendFileChange={handleSendFile}
          onSendLocation={handleSendLocation}
        />
      </div>
    </>
  );
};

export default ChatComposer;
