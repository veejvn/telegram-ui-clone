"use client";
import React, { useRef, useState, useEffect } from "react";
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
import {
  Reply,
  Copy,
  Edit,
  Pin,
  Forward,
  Trash2,
  CheckCircle,
} from "lucide-react";
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
import { useMessageMenu } from "@/contexts/MessageMenuContext";

const TextMessage = ({ msg, isSender, animate, roomId }: MessagePros) => {
  //console.log("TextMessage rendered for:", msg.eventId); // Debug log
  //console.log("Message: " + msg.text + ", isDeleted: " + msg.isDeleted);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [transformOffset, setTransformOffset] = useState(0);
  const client = useMatrixClient();
  const router = useRouter();
  const { addMessage } = useForwardStore.getState();
  const holdTimeout = useRef<number | null>(null);
  const allowOpenRef = useRef(false);
  const updateMessage = useChatStore.getState().updateMessage;
  const isDeleted = msg.isDeleted || msg.text === "Tin nhắn đã thu hồi";
  const { activeMenuMessageId, setActiveMenuMessageId } = useMessageMenu();

  // Debug effect
  // useEffect(() => {
  //   console.log("TextMessage state changed:", {
  //     open,
  //     isDeleted,
  //     msgId: msg.eventId,
  //   });
  // }, [open, isDeleted, msg.eventId]);

  // Check if any menu is open and if this is the active one
  // const isAnyMenuOpen = activeMenuMessageId !== null;
  // const isThisMenuOpen = activeMenuMessageId === msg.eventId;

  // Mock reactions data - in real app this would come from msg.reactions
  const reactions = [
    { emoji: "❤️", count: 2, userReacted: false },
    { emoji: "👍", count: 1, userReacted: true },
    { emoji: "😊", count: 3, userReacted: false },
    { emoji: "😢", count: 1, userReacted: false },
    { emoji: "😡", count: 1, userReacted: false },
  ];

  const textClass = clsx(
    "rounded-3xl px-4 py-1.5 text-[#181818] bg-[#cbc1b8] dark:text-[#181818] dark:bg-[#cbc1b8]",
    // isSender
    //   ? "text-[#181818] bg-[#cbc1b9] dark:text-[#181818] dark:bg-[#cbc1b9]"
    //   : "text-[#181818] bg-[#cbc1b9] dark:text-[#181818] dark:bg-[#cbc1b9]",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex text-[#444444] items-center justify-end gap-1 text-[10px] mt-1 select-none pb-2"
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

  const handleReactionClick = (emoji: string) => {
    // Handle reaction click - toggle user's reaction
    console.log(`Reaction clicked: ${emoji}`);
    console.log("handleReactionClick called!"); // Additional debug
    // Đóng sự kiện click vào reaction
    if (open) {
      setOpen(false);
      setActiveMenuMessageId(null); // Clear active message
      setTransformOffset(0); // Reset vị trí tin nhắn
    }
    // In real app, this would call an API to add/remove reaction
  };

  const handleHoldStart = () => {
    // Nếu menu đã mở thì không làm gì
    if (open || isDeleted) return;
    holdTimeout.current = window.setTimeout(() => {
      // Tính toán và di chuyển tin nhắn lên vị trí tối ưu
      calculateOptimalPosition();
    }, 1000);
  };

  const calculateOptimalPosition = () => {
    const messageElement = document.querySelector(
      `[data-message-id="${msg.eventId}"]`
    );
    if (!messageElement) {
      // Fallback: mở menu ngay nếu không tìm thấy element
      allowOpenRef.current = true;
      setOpen(true);
      return;
    }

    const rect = messageElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Không gian cần thiết: reactions (80px) + dropdown (420px) + buffer (50px) = 550px
    const requiredSpace = 550;

    // Vị trí tối ưu: tin nhắn nên cách top viewport khoảng 100px (thấp hơn một chút)
    const optimalTop = 150;

    // Kiểm tra xem có đủ không gian ở dưới không
    const availableSpaceBelow = viewportHeight - rect.bottom;
    const currentTop = rect.top;

    if (availableSpaceBelow < requiredSpace && currentTop > optimalTop) {
      // Tính toán khoảng cách cần di chuyển lên
      const moveUpDistance = Math.min(
        currentTop - optimalTop, // Không di chuyển quá vị trí tối ưu
        requiredSpace - availableSpaceBelow // Chỉ di chuyển đủ để có không gian
      );

      setTransformOffset(-moveUpDistance);
    } else {
      setTransformOffset(0);
    }

    // Mở menu sau khi đã set transform
    setTimeout(() => {
      allowOpenRef.current = true;
      setOpen(true);
    }, 100);
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
        setActiveMenuMessageId(msg.eventId); // Set active message
        allowOpenRef.current = false;
      }
      // Nếu không phải giữ lâu thì bỏ qua (không mở)
    } else {
      setOpen(false);
      setActiveMenuMessageId(null); // Clear active message
      setTransformOffset(0); // Reset vị trí tin nhắn
      allowOpenRef.current = false;
    }
  };

  return (
    <>
      {/* Overlay khi menu mở - đặt bên ngoài và z-index cao nhất */}
      {open && !isDeleted && (
        <div className="fixed inset-0 bg-white opacity-90 z-[100]" />
      )}

      <div
        className={clsx(
          "flex flex-col relative transition-transform duration-300 ease-out",
          open ? "z-[110]" : "z-auto"
        )}
        data-message-id={msg.eventId}
        {...(transformOffset !== 0 && {
          style: { transform: `translateY(${transformOffset}px)` },
        })}
      >
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <div
              // onMouseDown={handleHoldStart}
              // onMouseUp={handleHoldEnd}
              // onMouseLeave={handleHoldEnd}
              onTouchStart={isDeleted ? undefined : handleHoldStart}
              onTouchEnd={isDeleted ? undefined : handleHoldEnd}
              className={clsx(
                "flex flex-col relative transition-opacity duration-200",
                open && "z-[115]"
              )}
            >
              {/* Reactions - hiển thị cùng lúc với DropdownMenu */}
              {open && !isDeleted && (
                <div
                  className="flex gap-1 mb-2 justify-center relative z-[120]"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Reaction container clicked!"); // Debug log
                  }}
                >
                  <div className="flex gap-1 bg-white rounded-full px-3 py-2 shadow-md border border-gray-200">
                    {reactions.map((reaction, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => {
                          console.log("Reaction mouseDown!");
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          console.log("Reaction touchStart!");
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          console.log("Reaction BUTTON clicked!"); // Debug log
                          e.stopPropagation();
                          e.preventDefault();
                          handleReactionClick(reaction.emoji);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 text-xs cursor-pointer transition-all hover:scale-105 border-0 bg-transparent ${
                          reaction.userReacted
                            ? "bg-blue-100 rounded-full"
                            : "hover:bg-gray-100 rounded-full"
                        }`}
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        {reaction.count > 0 && (
                          <span className="text-xs text-gray-600">
                            {reaction.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
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
                  <div
                    className={clsx(
                      "text-[#cbc1b9] absolute bottom-1 right-[-10px] w-[16px]"
                    )}
                  >
                    <BubbleTail isSender={true} fillColor="currentColor" />
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          {!isDeleted && (
            <DropdownMenuContent
              className="mx-2 min-w-[200px] rounded-3xl relative z-[120]"
              side="bottom"
              align="center"
              sideOffset={10}
              alignOffset={0}
            >
              <DropdownMenuItem className="flex justify-between items-center py-1">
                <span className="text-sm">Reply</span>
                <Reply size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={() => handleCopy(msg.text)}
              >
                <span className="text-sm">Copy</span>
                <Copy size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-between items-center py-1">
                <span className="text-sm">Edit</span>
                <Edit size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-between items-center py-1">
                <span className="text-sm">Pin</span>
                <Pin size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={handleForward}
              >
                <span className="text-sm">Forward</span>
                <Forward size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={handleDelete}
              >
                <span className="text-sm text-red-500">Delete</span>
                <Trash2 size={16} className="text-red-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-between items-center py-1">
                <span className="text-sm">Select</span>
                <CheckCircle size={16} className="text-blue-500" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </>
  );
};

export default TextMessage;
