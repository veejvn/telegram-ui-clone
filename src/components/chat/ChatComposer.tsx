"use client";

import { useRef, useState, useEffect } from "react";
import { Eclipse, Mic, Paperclip, Smile, StopCircle } from "lucide-react";
import {
  sendImageMessage,
  sendMessage,
  sendTypingEvent,
  sendVoiceMessage,
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

const ChatComposer = ({ roomId }: { roomId: string }) => {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

  const [recordTime, setRecordTime] = useState(0);
  const recordIntervalRef = useRef<number | null>(null);

  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const client = useMatrixClient();
  const theme = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  useTyping(roomId);
  const { addMessage } = useChatStore.getState();
  const { messages: forwardMessages, clearMessages } = useForwardStore();

  // Start voice recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.start();
    setRecorder(mr);
    setAudioChunks(chunks);
    setIsRecording(true);

    // reset counter và bật timer
    setRecordTime(0);
    recordIntervalRef.current = window.setInterval(() => {
      setRecordTime(t => t + 1);
    }, 1000);
  };

  // Stop và gửi voice
  const stopRecording = () => {
    if (!recorder || !client) return;
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    recorder.onstop = async () => {
      // 1) Tạo blob từ chunks
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: blob.type });

      // 2) Dùng ngay recordTime đã đếm được làm duration
      await sendVoiceMessage(client, roomId, file, recordTime);

      // 3) reset chunks (và nếu muốn reset time cũng có thể)
      setAudioChunks([]);
      setRecordTime(0);
    };
    recorder.stop();
    setIsRecording(false);
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

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    try {
      await sendImageMessage(client, roomId, file);
      console.log("Image sent successfully");
    } catch (err) {
      console.error("Failed to send image:", err);
    } finally {
      e.target.value = ""; // reset input
    }
  };
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
  }, []);

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



  return (
    <div className="bg-white dark:bg-[#1c1c1e]">
      {forwardMessages.length > 0 && <ForwardMsgPreview />}
      {isRecording && (
        <div className="px-4 py-2">
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: `${Math.min((recordTime / 60) * 100, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {recordTime}s
          </div>
        </div>
      )}

      <div className="relative flex justify-between items-center px-2.5 py-2 lg:py-3 pb-10">
        <Paperclip
          onClick={() => inputRef.current?.click()}
          className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
          size={30}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChangeFile}
          className="hidden"
          aria-label="file"
        />
        <div
          className={`outline-2 p-1.5 mx-1.5 relative ${isMultiLine ? "rounded-2xl" : "rounded-full"
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
          isRecording ? (
            <StopCircle
              size={35}
              className="text-red-500 cursor-pointer hover:scale-110 transition-all duration-700"
              onClick={stopRecording}
            />
          ) : (
            <Mic
              size={35}
              className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all duration-700"
              onClick={startRecording}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ChatComposer;
