"use client";
import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import { useTheme } from "next-themes";
import { BubbleTail } from "./BubbleTail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CopyIconSvg from "../icons/CopyIconSvg";
import ForwardIconSvg from "../icons/ForwardIconSvg";
import BinIconSvg from "../icons/BinIconSvg";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForwardStore } from "@/stores/useForwardStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { linkify } from "@/utils/chat/linkify";
import { useChatStore } from "@/stores/useChatStore";
import { deleteMessage } from "@/services/chatService";

const TextMessage = ({ msg, isSender, animate, roomId }: MessagePros) => {
  //console.log("Message: " + msg.text + ", isDeleted: " + msg.isDeleted);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const client = useMatrixClient();
  const router = useRouter();
  const { addMessage } = useForwardStore.getState();
  const holdTimeout = useRef<number | null>(null);
  const allowOpenRef = useRef(false);
  const updateMessage = useChatStore.getState().updateMessage;
  const isDeleted = msg.isDeleted || msg.text === "Tin nhắn đã thu hồi";

  const textClass = clsx(
    "rounded-3xl px-4 py-1.5 text=[#181818] bg-[#cbc1b9] dark:text=[#181818] dark:bg-[#cbc1b9]",
    // isSender
    //   ? "text=[#181818] bg-[#cbc1b9] dark:text=[#181818] dark:bg-[#cbc1b9]"
    //   : "text=[#181818] bg-[#cbc1b9] dark:text=[#181818] dark:bg-[#cbc1b9]",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex text-[#444444] items-center justify-end gap-1 text-xs mt-1 select-none pb-2",
    // isSender
    //   ? "text-[#444444] dark:text-white"
    //   : "text-gray-400 dark:text-gray-400"
  );

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy text");
    }
  };

  const handleForward = async () => {
    if (!msg.text || !msg.sender || !msg.time || !client) return;
    router.push("/chat/forward");

    setTimeout(() => {
      addMessage({
        text: msg.text,
        senderId: msg.sender,
        sender: msg.senderDisplayName!,
        time: msg.time,
      });
    }, 1000);
  };

  const handleDelete = async () => {
    if (!client || !roomId) return;
    // console.log(
    //   "Delete Message in TextMessage " + " roomId: " + roomId + " eventId: " + msg.eventId
    // );
    try {
      updateMessage(roomId ?? "", msg.eventId, { text: "Tin nhắn đã thu hồi" });
      const res = await deleteMessage(client, roomId, msg.eventId);
      if (res.success) {
        console.log("Delete message successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleHoldStart = () => {
    // Nếu menu đã mở thì không làm gì
    if (open || isDeleted) return;
    holdTimeout.current = window.setTimeout(() => {
      allowOpenRef.current = true;
      setOpen(true);
    }, 1000);
  };

  const handleHoldEnd = () => {
    // Nếu chưa đủ 3s thì clear timeout, không mở menu
    if (isDeleted) return;
    if (!open && holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    // Nếu menu đã mở thì không đóng ở đây (để user chọn menu)
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleted) return;
    if (nextOpen) {
      // Chỉ cho phép mở nếu là do giữ lâu
      if (allowOpenRef.current) {
        setOpen(true);
        allowOpenRef.current = false;
      }
      // Nếu không phải giữ lâu thì bỏ qua (không mở)
    } else {
      setOpen(false);
      allowOpenRef.current = false;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div
          // onMouseDown={handleHoldStart}
          // onMouseUp={handleHoldEnd}
          // onMouseLeave={handleHoldEnd}
          onTouchStart={isDeleted ? undefined : handleHoldStart}
          onTouchEnd={isDeleted ? undefined : handleHoldEnd}
          className={clsx(
            "flex relative items-end text-message", // Đảm bảo tail căn đáy với bubble
            isSender ? "justify-end" : "justify-start",
            isDeleted && "cursor-default"
          )}
        >
          {/* 🡐 Tail cho tin nhận */}
          {!isSender && (
            <div className="text-[#cbc1b9] absolute bottom-1 left-[-7px] w-[16px]">
              <BubbleTail isSender={false} fillColor="currentColor" />
            </div>
          )}

          {/* 💬 Nội dung tin nhắn */}
          <div className="flex flex-col  ">
            <div className={clsx(textClass, "max-w-[75vw] break-words")}>
              <p
                className={
                  "py-2 whitespace-pre-wrap break-words leading-snug select-none"
                }
              >
                {linkify(msg.text)}
              </p>

              <div className={timeClass}>
                {formatMsgTime(msg.time)}
                {isSender &&
                  (msg.status === "read" ? (
                    <CheckCheck size={14} />
                  ) : (
                    <Check size={14} />
                  ))}
              </div>
            </div>
          </div>

          {/* 🡒 Tail cho tin gửi */}
          {isSender && (
            <div className={clsx("text-[#cbc1b9] absolute bottom-1 right-[-10px] w-[16px]")}>
              <BubbleTail isSender={true} fillColor="currentColor" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      {!isDeleted && (
        <DropdownMenuContent className="mx-2">
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={() => handleCopy(msg.text)}
          >
            <p>Copy</p>
            <CopyIconSvg isDark={theme.resolvedTheme === "dark"} />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={handleForward}
          >
            <p>Forward</p>
            <ForwardIconSvg isDark={theme.resolvedTheme === "dark"} />
          </DropdownMenuItem>
          {isSender && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-between items-center"
                onClick={handleDelete}
              >
                <p className="text-red-500">Delete</p>
                <BinIconSvg />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default TextMessage;
