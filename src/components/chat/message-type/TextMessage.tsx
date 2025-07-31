"use client";
import React, { useRef, useState, useEffect } from "react";
import { clsx } from "clsx";
import { Check, CheckCheck, CheckCircle } from "lucide-react";
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
import { Reply, Copy, Edit, Pin, Forward, Trash2 } from "lucide-react";
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
import { useSelectionStore } from "@/stores/useSelectionStore";

const TextMessage = ({ msg, isSender, animate, roomId }: MessagePros) => {
  //console.log("TextMessage rendered for:", msg.eventId); // Debug log
  //console.log("Message: " + msg.text + ", isDeleted: " + msg.isDeleted);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [transformOffset, setTransformOffset] = useState(0);
  const client = useMatrixClient();
  const router = useRouter();
  const { addMessage } = useForwardStore.getState();
  const holdTimeout = useRef<number | null>(null);
  const allowOpenRef = useRef(false);
  const updateMessage = useChatStore.getState().updateMessage;
  const isDeleted = msg.isDeleted || msg.text === "Tin nhắn đã thu hồi";
  const { activeMenuMessageId, setActiveMenuMessageId } = useMessageMenu();

  // Selection store
  const {
    isSelectionMode,
    isMessageSelected,
    toggleMessage,
    enterSelectionMode,
  } = useSelectionStore();

  const isSelected = isMessageSelected(msg.eventId);

  // Mock reactions data - in real app this would come from msg.reactions
  const reactions = [
    { emoji: "❤️", count: 2, userReacted: false },
    { emoji: "👍", count: 1, userReacted: false },
    { emoji: "😊", count: 3, userReacted: false },
    { emoji: "😢", count: 1, userReacted: false },
    { emoji: "😡", count: 1, userReacted: false },
  ];

  const textClass = clsx(
    "rounded-3xl px-4 py-1.5 text-[#181818] dark:text-[#181818] transition-all duration-200",
    // Background colors
    "bg-[#808080]/30 dark:bg-[#808080]",
    animate && "flash-background"
  );

  const timeClass = clsx(
    "flex text-[#444444] items-center justify-end gap-1 text-[10px] select-none pb-2"
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
      setShowOverlay(false); // Ẩn overlay khi click reaction
      setActiveMenuMessageId(null); // Clear active message
      setTransformOffset(0); // Reset vị trí tin nhắn
    }
    // In real app, this would call an API to add/remove reaction
  };

  const handleHoldStart = () => {
    // Nếu tin nhắn đã bị xóa thì không làm gì
    if (isDeleted) return;

    // Nếu đã ở selection mode thì không làm gì (click sẽ handle)
    if (isSelectionMode) return;

    holdTimeout.current = window.setTimeout(() => {
      // Enter selection mode với tin nhắn này
      enterSelectionMode(msg.eventId);
    }, 500); // Giảm thời gian từ 1000ms xuống 500ms
  };

  const handleHoldEnd = () => {
    // Clear timeout nếu chưa đủ thời gian
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
  };

  const handleClick = () => {
    // Nếu tin nhắn đã bị xóa thì không làm gì
    if (isDeleted) return;

    // Nếu đang ở selection mode thì toggle selection
    if (isSelectionMode) {
      toggleMessage(msg.eventId);
      return;
    }

    // Hiển thị overlay ngay lập tức khi click
    setShowOverlay(true);

    // Nếu không ở selection mode thì hiện reactions + dropdown menu
    allowOpenRef.current = true;
    calculateOptimalPosition();
  };

  const calculateOptimalPosition = () => {
    const messageElement = document.querySelector(
      `[data-message-id="${msg.eventId}"]`
    );
    if (!messageElement) {
      // Fallback: mở menu ngay nếu không tìm thấy element
      allowOpenRef.current = true;
      setOpen(true);
      setActiveMenuMessageId(msg.eventId);
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
      setActiveMenuMessageId(msg.eventId);
    }, 100);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleted || isSelectionMode) return;
    if (nextOpen) {
      // Chỉ cho phép mở nếu không ở selection mode
      if (allowOpenRef.current && !isSelectionMode) {
        setOpen(true);
        setActiveMenuMessageId(msg.eventId);
        allowOpenRef.current = false;
      }
    } else {
      setOpen(false);
      setShowOverlay(false); // Ẩn overlay khi menu đóng
      setActiveMenuMessageId(null);
      setTransformOffset(0);
      allowOpenRef.current = false;
    }
  };

  return (
    <>
      {/* Overlay khi menu mở - chỉ hiện khi không ở selection mode */}
      {showOverlay && !isDeleted && !isSelectionMode && (
        <div className="fixed inset-0 bg-[#FFFFFF3D] backdrop-blur-[50px] z-[100]" />
      )}

      <div
        className={clsx(
          "flex flex-col relative transition-transform duration-300 ease-out",
          (showOverlay || open) && !isSelectionMode ? "z-[110]" : "z-auto",
          // Transition cho selection
          isSelectionMode && "transition-all duration-200"
        )}
        data-message-id={msg.eventId}
        {...(transformOffset !== 0 && {
          style: { transform: `translateY(${transformOffset}px)` },
        })}
      >
        <DropdownMenu
          open={open && !isSelectionMode}
          onOpenChange={handleOpenChange}
        >
          <DropdownMenuTrigger asChild>
            <div
              onClick={handleClick}
              onTouchStart={isDeleted ? undefined : handleHoldStart}
              onTouchEnd={isDeleted ? undefined : handleHoldEnd}
              onMouseDown={isDeleted ? undefined : handleHoldStart}
              onMouseUp={isDeleted ? undefined : handleHoldEnd}
              onMouseLeave={isDeleted ? undefined : handleHoldEnd}
              className={clsx(
                "flex flex-col relative transition-opacity duration-200 cursor-pointer",
                (showOverlay || open) && !isSelectionMode && "z-[115]"
              )}
            >
              {/* Reactions - chỉ hiển thị khi không ở selection mode */}
              {open && !isDeleted && !isSelectionMode && (
                <div
                  className={clsx("absolute top-[-45px] transform -translate-x-1/2 flex gap-1 justify-center z-[120]", !isSender && "left-23")}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Reaction container clicked!");
                  }}
                >
                  <div className="flex bg-[#FFFFFF4D] justify-between rounded-full w-[192px] px-3 py-2 shadow-md border border-gray-200">
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
                          console.log("Reaction BUTTON clicked!");
                          e.stopPropagation();
                          e.preventDefault();
                          handleReactionClick(reaction.emoji);
                        }}
                        className={`flex items-center text-xs cursor-pointer transition-all hover:scale-105 border-0 bg-transparent ${
                          reaction.userReacted
                            ? "bg-blue-100 rounded-full"
                            : "hover:bg-gray-100 rounded-full"
                        }`}
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex relative items-end w-full">
                {/* Container cho tin nhắn với justify riêng */}
                <div
                  className={clsx(
                    "flex relative items-end text-message flex-1",
                    isSender ? "justify-end" : "justify-start",
                    isDeleted && "cursor-default",
                    // Làm mờ toàn bộ tin nhắn nếu chưa được chọn trong selection mode
                    isSelectionMode && !isSelected && "opacity-50"
                  )}
                >
                  {/* Check icon cho tin gửi - đặt bên trái (chỉ khi không ở selection mode) */}
                  {isSender && !isSelectionMode && (
                    <div className="flex items-end mr-2 my-auto">
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${
                          msg.status === "read" ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    </div>
                  )}

                  {/* 🡐 Tail cho tin nhận */}
                  {!isSender && (
                    <div className="text-[#808080]/30 absolute bottom-1 left-[-7px] w-[16px]">
                      <BubbleTail isSender={false} fillColor="currentColor" />
                    </div>
                  )}

                  {/* 💬 Nội dung tin nhắn */}
                  <div className="flex flex-col  ">
                    <div
                      className={clsx(textClass, "max-w-[75vw] break-words")}
                    >
                      <p
                        className={
                          "py-2 whitespace-pre-wrap break-words leading-snug select-none"
                        }
                      >
                        {linkify(msg.text)}
                      </p>

                      <div className={timeClass}>{formatMsgTime(msg.time)}</div>
                    </div>
                  </div>

                  {/* 🡒 Tail cho tin gửi */}
                  {isSender && (
                    <div
                      className={clsx(
                        "text-[#808080]/30 absolute bottom-1 right-[-10px] w-[16px]"
                      )}
                    >
                      <BubbleTail isSender={true} fillColor="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          {!isDeleted && !isSelectionMode && (
            <DropdownMenuContent
              className="mx-2 w-[192px] h-[261px] rounded-3xl relative z-[120]"
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
