"use client";

import { useRef, useState, useEffect } from "react";
import { Eclipse, Mic, Paperclip, Smile } from "lucide-react";
import { sendMessage } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useTheme } from "next-themes";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

const ChatComposer = ({ roomId }: { roomId: string }) => {
  const [text, setText] = useState("");
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const client = useMatrixClient();
  const theme = useTheme();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !client) return;

    sendMessage(roomId, trimmed, client)
      .then((res) => {
        if (res.success) {
          console.log("Sent Message: ", text);
          setText("");
        } else {
          console.log("Send Failed !");
        }
      })
      .catch((res) => {
        console.log(res.error.Message);
      });
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
    <div className="relative flex justify-between items-center bg-white dark:bg-[#1c1c1e] px-2.5 py-2 lg:py-3">
      <Paperclip
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          className="flex-1 h-auto resize-none bg-transparent outline-none px-3 max-h-[6rem] overflow-y-auto text-sm text-black dark:text-white scrollbar-thin"
          style={{ lineHeight: "1.5rem" }}
        />

        {/* {text.trim() && ( */}
          <Smile
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
            size={30}
          />
        {/* )} */}

        {/* <Eclipse
          className="text-[#858585] hover:scale-110 hover:text-zinc-300 cursor-pointer transition-all ease-in-out duration-700"
          size={30}
        /> */}

        {/* {!text.trim() && (
          <Eclipse className="text-[#858585] cursor-default" size={30} />
        )} */}

        {showEmojiPicker && (
          <div className="absolute bottom-12 left-6 z-50">
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
      
      {text.trim() ? (
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
  );
};

export default ChatComposer;
