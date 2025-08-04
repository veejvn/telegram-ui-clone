"use client";
import React, { useEffect, useRef, useState } from "react";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { linkify } from "@/utils/chat/linkify";
import { usePinStore } from "@/stores/usePinStore";
import {
  pinMessage,
  unpinMessage,
  isMessagePinned,
} from "@/services/pinService";
import { Pin, Reply, Copy, Forward, Trash2 } from "lucide-react";

type ForwardTextMessageProps = MessagePros & {
  forwardMessage: {
    text: string;
    originalSender: string;
    originalSenderId: string;
  };
};

const ForwardTextMessage = ({
  msg,
  isSender,
  animate,
  forwardMessage,
  roomId,
}: ForwardTextMessageProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const router = useRouter();
  const client = useMatrixClient();
  const { text, originalSender, originalSenderId } = forwardMessage;
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const holdTimeout = useRef<number | null>(null);
  const allowOpenRef = useRef(false);
  //console.log(avatarUrl);

  // Pin store
  const {
    pinMessage: pinToStore,
    unpinMessage: unpinFromStore,
    isMessagePinned: isPinnedInStore,
  } = usePinStore();

  // Use reactive store subscription for pin status
  const isPinned = usePinStore((state) =>
    state.isMessagePinned(roomId || "", msg.eventId)
  );

  useEffect(() => {
    if (!client || !originalSenderId) return;

    const user = client.getUser(originalSenderId);
    const mxcUrl = user?.avatarUrl;

    if (mxcUrl) {
      const httpUrl = client.mxcUrlToHttp(mxcUrl, 96, 96, "crop") ?? "";
      setAvatarUrl(httpUrl);
    }
  }, [client, originalSenderId]);

  const textClass = clsx(
    "rounded-2xl px-4 py-1.5",
    isSender
      ? "text-black bg-[#DCF8C6] dark:text-white dark:bg-[#6f42c1] rounded-br-none"
      : "text-black bg-white dark:text-white dark:bg-[#282434] rounded-bl-none",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex items-center justify-end gap-1 text-xs mt-1",
    isSender
      ? "text-[#79c071] dark:text-white"
      : "text-gray-400 dark:text-gray-400"
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

    const { addMessage } = useForwardStore.getState();
    router.push("/chat/forward");

    setTimeout(() => {
      addMessage({
        text: text,
        senderId: msg.sender,
        sender: msg.senderDisplayName!,
        time: msg.time,
      });
    }, 1000);
  };

  const handlePin = async () => {
    if (!client || !roomId) return;

    try {
      if (isPinned) {
        // Unpin message
        const result = await unpinMessage(client, roomId, msg.eventId);
        if (result.success) {
          unpinFromStore(roomId, msg.eventId);
        } else {
          toast.error(result.error || "Failed to unpin message");
        }
      } else {
        // Pin message
        const result = await pinMessage(client, roomId, msg.eventId);
        if (result.success) {
          // Add to local store
          pinToStore(roomId, {
            eventId: msg.eventId,
            text: msg.text,
            sender: msg.sender || "",
            senderDisplayName: msg.senderDisplayName,
            time: msg.time,
            timestamp: msg.timestamp,
            type: msg.type || "text",
            roomId,
            pinnedAt: Date.now(),
          });
        } else {
          toast.error(result.error || "Failed to pin message");
        }
      }

      setOpen(false);
    } catch (error) {
      console.error("Error handling pin:", error);
      toast.error("Failed to pin/unpin message");
    }
  };

  const handleHoldStart = () => {
    // Nếu menu đã mở thì không làm gì
    if (open) return;
    holdTimeout.current = window.setTimeout(() => {
      allowOpenRef.current = true;
      setOpen(true);
    }, 1000);
  };

  const handleHoldEnd = () => {
    // Nếu chưa đủ 3s thì clear timeout, không mở menu
    if (!open && holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    // Nếu menu đã mở thì không đóng ở đây (để user chọn menu)
  };

  const handleOpenChange = (nextOpen: boolean) => {
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
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          className={clsx(
            "flex items-end", // Đảm bảo tail căn đáy với bubble
            isSender ? "justify-end" : "justify-start",
            "select-none"
          )}
        >
          {/* 🡐 Tail cho tin nhận */}
          {!isSender && (
            <div className="text-[#FFFFFF] dark:text-[#282434]">
              <BubbleTail isSender={false} fillColor="currentColor" />
            </div>
          )}

          {/* 💬 Nội dung tin nhắn */}
          <div className="flex flex-col">
            <div className={textClass}>
              <p
                className={
                  "whitespace-pre-wrap break-words leading-snug text-sm"
                }
              >
                Forwarded from
              </p>
              <p
                className={
                  "whitespace-pre-wrap break-words leading-snug flex gap-1 text-sm"
                }
              >
                <Avatar className="h-5 w-5">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="avatar" />
                  ) : (
                    <>
                      <AvatarImage src="" alt="Unknow" />
                      <AvatarFallback className="bg-purple-400 text-white text-[10px] font-bold">
                        {originalSender.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                {originalSender}
              </p>
              <p
                className={
                  "whitespace-pre-wrap break-words leading-snug max-w-[70vw]"
                }
              >
                {linkify(text)}
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
            <div className="text-[#DCF8C6] dark:text-[#6f42c1]">
              <BubbleTail isSender={true} fillColor="currentColor" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={handlePin}
        >
          <p>{isPinned ? "Unpin" : "Pin"}</p>
          <Pin
            size={16}
            className={isPinned ? "text-red-500" : "text-blue-500"}
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between items-center">
          <p className="text-red-500">Delete</p>
          <BinIconSvg />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ForwardTextMessage;
