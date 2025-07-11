"use client";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { sendMessage } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { Loader2, Smile } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import MultiForwardMsgPreview from "./MultiForwardMsgPreview";
import { useForwardStore } from "@/stores/useForwardStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForwardComposer() {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const client = useMatrixClient();
  const theme = useTheme();
  const { addMessage } = useChatStore.getState();
  const router = useRouter();
  const {
    messages: forwardMessages,
    clearMessages,
    roomIds,
    clearRooms,
  } = useForwardStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!client) return;
    setIsLoading(true);
    const trimmed = text.trim();
    const userId = client.getUserId();
    const now = new Date();
    const timestamp = now.getTime();
    const timeString = now.toLocaleString();

    try {
      // 1. GỬI TEXT MESSAGE TRƯỚC CHO TẤT CẢ ROOM
      if (trimmed) {
        for (let i = 0; i < roomIds.length; i++) {
          const roomId = roomIds[i];
          const localId = `local_${timestamp}_${i}`;

          addMessage(roomId, {
            eventId: localId,
            sender: userId ?? undefined,
            senderDisplayName: userId ?? undefined,
            text: trimmed,
            time: timeString,
            timestamp,
            status: "sent",
            type: isOnlyEmojis(trimmed) ? "emoji" : "text",
          });

          await sendMessage(roomId, trimmed, client);
        }
      }

      // 2. GỬI FORWARD MESSAGE SAU KHI TEXT ĐÃ GỬI HẾT
      if (forwardMessages.length > 0) {
        for (let i = 0; i < roomIds.length; i++) {
          const roomId = roomIds[i];

          for (let j = 0; j < forwardMessages.length; j++) {
            const fwd = forwardMessages[j];
            const fwdId = `fwd_${timestamp}_${i}_${j}`;
            const forwardBody = JSON.stringify({
              forward: true,
              originalSenderId: fwd.senderId,
              originalSender: fwd.sender,
              text: fwd.text,
            });

            addMessage(roomId, {
              eventId: fwdId,
              sender: userId ?? undefined,
              senderDisplayName: fwd.sender,
              text: forwardBody,
              time: timeString,
              timestamp,
              status: "sent",
              type: "text",
              isForward: true,
            });

            await sendMessage(roomId, forwardBody, client);
          }
        }
      }

      // DỌN DẸP SAU KHI GỬI XONG
      clearMessages();
      clearRooms();
      setText("");
      setShowEmojiPicker(false);
      router.back();

      // TOAST THÔNG BÁO
      const roomNames = roomIds
        .map((id) => client.getRoom(id)?.name)
        .filter((name): name is string => Boolean(name));

      if (roomNames.length === 1) {
        toast.success(`Message sent to ${roomNames[0]}`);
      } else if (roomNames.length === 2) {
        toast.success(`Message sent to ${roomNames[0]} and ${roomNames[1]}`);
      } else if (roomNames.length > 2) {
        toast.success(
          `Message sent to ${roomNames[0]} and ${
            roomNames.length - 1
          } other chats`
        );
      } else {
        toast.success(`Message forwarded`);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to forward message.");
    } finally {
      setIsLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
  };
  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
  };
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + "px"; // max 3 dòng

      setIsMultiLine(textarea.scrollHeight > 48); // 2 dòng trở lên
    }
  }, [text]);

  return (
    <div className="bg-white dark:bg-[#1c1c1e]">
      <MultiForwardMsgPreview />
      <div className="relative flex justify-between items-center px-2 py-1.5 lg:py-3 pb-10">
        <div
          className={`outline-2 p-1 mx-1 relative ${
            isMultiLine ? "rounded-2xl" : "rounded-full"
          } flex items-center justify-between w-full bg-[#f0f0f0] dark:bg-[#2b2b2d]`}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            readOnly={isLoading}
            rows={1}
            className="flex-1 h-auto resize-none bg-transparent outline-none px-3 max-h-[6rem] overflow-y-auto text-lg text-black dark:text-white scrollbar-thin"
          />
          {text.trim() && (
            <Smile
              onClick={() => !isLoading && setShowEmojiPicker((prev) => !prev)}
              className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
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

        {roomIds.length > 0 ? (
          <button disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            ) : (
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
            )}
          </button>
        ) : (
          <button disabled aria-label="input">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-10 cursor-pointer opacity-30"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
