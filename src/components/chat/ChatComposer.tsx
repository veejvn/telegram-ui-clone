"use client";

import { useRef, useState, useEffect } from "react";
import { CircleEllipsis, Eclipse, Mic, Paperclip, Smile } from "lucide-react";
import {
  sendImageMessage,
  sendMessage,
  sendTypingEvent,
} from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useTheme } from "next-themes";
import { useChatStore } from "@/stores/useChatStore";
import TypingIndicator from "./TypingIndicator";
import useTyping from "@/hooks/useTyping";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import ForwardMsgPreview from "./ForwardMsgPreview";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { useForwardStore } from "@/stores/useForwardStore";
import {
  Image as LucideImage,
  File,
  MapPin,
  Gift,
  Reply,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ChatComposer = ({ roomId }: { roomId: string }) => {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useMatrixClient();
  const theme = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  useTyping(roomId);
  const { addMessage } = useChatStore.getState();
  const { messages: forwardMessages, clearMessages } = useForwardStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<
    "gallery" | "gift" | "file" | "location" | "reply" | "checklist"
  >("gallery");
  const sheetRef = useRef<HTMLDivElement>(null);

  const LocationMap = dynamic(() => import("@/components/common/LocationMap"), { ssr: false });

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
        const localId = "fwd_" + Date.now() + Math.random();
        const forwardBody = JSON.stringify({
          forward: true,
          originalSenderId: fwd.senderId,
          originalSender: fwd.sender,
          text: fwd.text,
        });

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
    setText((prev) => prev + emojiData.emoji);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;
    const userId = client.getUserId();

    try {
      setOpen(false)
      const { httpUrl } = await sendImageMessage(client, roomId, file);
      const localId = "local_" + Date.now();
      const now = new Date();

      addMessage(roomId, {
        eventId: localId,
        sender: userId ?? undefined,
        senderDisplayName: userId ?? undefined,
        text: file.name,
        imageUrl: httpUrl,
        time: now.toLocaleString(),
        timestamp: now.getTime(),
        status: "sent",
        type: "image",
      });
      console.log("Image sent successfully");
    } catch (err) {
      console.error("Failed to send image:", err);
    } finally {
      e.target.value = ""; // reset input
    }
  };

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

  return (
    <div className="bg-white dark:bg-[#1c1c1e]">
      {forwardMessages.length > 0 && <ForwardMsgPreview />}
      <div className="relative flex justify-between items-center px-2.5 py-2 lg:py-3 pb-10">
        <Paperclip
          // onClick={() => inputRef.current?.click()}
          onClick={() => setOpen(true)}
          className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
          size={30}
        />
        <div
          className={`outline-2 p-1.5 mx-1.5 relative ${
            isMultiLine ? "rounded-2xl" : "rounded-full"
          } flex items-center justify-between w-full bg-[#f0f0f0] dark:bg-[#2b2b2d]`}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className="flex-1 h-auto resize-none bg-transparent outline-none px-3 max-h-[6rem] overflow-y-auto text-lg text-black dark:text-white scrollbar-thin"
          />
          {text.trim() ? (
            <Smile
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
              size={30}
            />
          ) : (
            <Eclipse
              // onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-[#858585] cursor-default"
              size={30}
            />
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-12 right-2 z-50">
              <EmojiPicker
                width={300}
                height={350}
                onEmojiClick={handleEmojiClick}
                theme={
                  theme.theme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT
                }
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-14 left-0 z-50 pb-8">
          <TypingIndicator roomId={roomId} />
        </div>

        {text.trim() || forwardMessages.length > 0 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-10 cursor-pointer hover:scale-110 duration-300 transition-all ease-in-out"
            onClick={handleSend}
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
              clipRule="evenodd"
              className="text-blue-600"
            />
          </svg>
        ) : (
          <Mic
            className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
            size={35}
          />
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black rounded-t-2xl shadow-2xl pb-10"
            ref={sheetRef}
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full p-2 px-4 font-medium text-gray-600 capitalize">
              <Button
                variant={"link"}
                className="text-blue-500"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              {tab}
              <CircleEllipsis className="mx-4" />
            </div>

            {/* Content */}
            <div className="p-2">
              {tab === "gallery" && (
                <div className="flex justify-center items-center h-40">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    Chọn ảnh
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFiles}
                className="hidden"
                aria-label="file"
              />
              {tab === "file" && (
                <div className="text-sm text-gray-500">
                  Hiển thị danh sách file...
                </div>
              )}
              {tab === "gift" && (
                <div className="text-sm text-gray-500">
                  Danh sách quà tặng...
                </div>
              )}
              {tab === "location" && (
                <div className="text-sm text-gray-500 h-[272px]">
                  <LocationMap/>
                </div>
              )}
              {tab === "reply" && (
                <div className="text-sm text-gray-500">
                  Chọn tin nhắn để trả lời...
                </div>
              )}
              {tab === "checklist" && (
                <div className="text-sm text-gray-500">Thêm checklist...</div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex justify-around border-t border-gray-200 px-4 py-2 text-xs text-center text-gray-600">
              <TabButton
                icon={<LucideImage className={`w-5 h-5 mb-1 ${tab === "gallery" ? "text-blue-500" : ""}`} />}
                label="Gallery"
                onClick={() => setTab("gallery")}
              />
              <TabButton
                icon={<Gift className={`w-5 h-5 mb-1 ${tab === "gift" ? "text-blue-500" : ""}`} />}
                label="Gift"
                onClick={() => setTab("gift")}
              />
              <TabButton
                icon={<File className={`w-5 h-5 mb-1 ${tab === "file" ? "text-blue-500" : ""}`} />}
                label="File"
                onClick={() => setTab("file")}
              />
              <TabButton
                icon={<MapPin className={`w-5 h-5 mb-1 ${tab === "location" ? "text-blue-500" : ""}`} />}
                label="Location"
                onClick={() => setTab("location")}
              />
              <TabButton
                icon={<Reply className={`w-5 h-5 mb-1 ${tab === "reply" ? "text-blue-500" : ""}`} />}
                label="Reply"
                onClick={() => setTab("reply")}
              />
              <TabButton
                icon={<Check className={`w-5 h-5 mb-1 ${tab === "checklist" ? "text-blue-500" : ""}`} />}
                label="Checklist"
                onClick={() => setTab("checklist")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatComposer;
