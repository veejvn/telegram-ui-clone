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
import { useEffect, useState } from "react";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { toast } from "sonner";

const EmojiMessage = ({ msg, isSender }: MessagePros) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-white justify-end" : "text-white"
  );

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

  useEffect(() => {
    let timeout: any;
    if (triggered) {
      timeout = setTimeout(() => setOpen(true), 350); // delay 300ms
    } else {
      setOpen(false);
    }
    return () => clearTimeout(timeout);
  }, [triggered]);
  return (
    <div className={"rounded-lg py-2"}>
      <DropdownMenu open={open} onOpenChange={setTriggered}>
        <DropdownMenuTrigger asChild>
          <div
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
