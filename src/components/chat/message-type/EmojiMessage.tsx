"use client";
import { clsx } from "clsx";
import { Check, CheckCheck } from "lucide-react";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
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
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { toast } from "sonner";
import { usePinStore } from "@/stores/usePinStore";
import {
  pinMessage,
  unpinMessage,
  isMessagePinned,
} from "@/services/pinService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { Pin, Reply, Copy, Forward, Trash2 } from "lucide-react";

const EmojiMessage = ({ msg, isSender, roomId }: MessagePros) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const client = useMatrixClient();

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
  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-white justify-end" : "text-white"
  );
  const holdTimeout = useRef<number | null>(null);
  const allowOpenRef = useRef(false);

  const getEmojiSizeByLength = (emojiText: string) => {
    const length = [...emojiText].length;
    if (length <= 1) return "text-8xl";
    if (length <= 2) return "text-7xl";
    if (length <= 3) return "text-6xl";
    if (length <= 4) return "text-5xl";
    if (length <= 6) return "text-4xl";
    if (length <= 7) return "text-3xl";
    if (length <= 8) return "text-2xl";
    return "text-xl";
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy text");
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
            type: msg.type || "emoji",
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
    <div className={"rounded-lg py-2"}>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className={clsx(
              "rounded-lg",
              open && "backdrop-blur-sm bg-black/10 dark:bg-white/10"
            )}
          >
            <p
              className={clsx(
                "whitespace-pre-wrap break-words leading-snug text-end",
                getEmojiSizeByLength(msg.text),
                isSender ? "text-right" : "text-left"
              )}
            >
              {msg.text}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={() => handleCopy(msg.text)}
          >
            <p>Copy</p>
            <CopyIconSvg isDark={theme.theme === "dark"} />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex justify-between items-center">
            <p>Forward</p>
            <ForwardIconSvg isDark={theme.theme === "dark"} />
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
      <div className={textClass}>
        <p
          className="backdrop-blur-sm backdrop-brightness-70 
                    overflow-hidden items-center
                    px-2 py-0.5 mt-3.5 flex gap-1 rounded-full"
        >
          {formatMsgTime(msg.time)}
          {isSender &&
            (msg.status === "read" ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            ))}
        </p>
      </div>
    </div>
  );
};

export default EmojiMessage;
