"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  CheckCheck,
  Check,
  Reply,
  Copy,
  Edit,
  Pin,
  Forward,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Message } from "@/stores/useChatStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import WaveSurfer from "wavesurfer.js";
import { useTheme } from "next-themes";
import { FaPause, FaPlay } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import { useForwardStore } from "@/stores/useForwardStore";
import { useChatStore } from "@/stores/useChatStore";
import { useMessageMenu } from "@/contexts/MessageMenuContext";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useReplyStore } from "@/stores/useReplyStore";
import { deleteMessage } from "@/services/chatService";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { toast } from "sonner";
import { BubbleTail } from "./BubbleTail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  msg: Message;
  isSender?: boolean;
  animate?: boolean;
  roomId?: string;
}

const AudioMessage: React.FC<Props> = ({
  msg,
  isSender = false,
  animate,
  roomId,
}) => {
  if (!msg.audioUrl) return null;

  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState<number>(msg.audioDuration ?? 0);
  const intervalRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const isDarkMode = false; // Force light mode as requested

  // Menu states - copied from TextMessage
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

  // Touch tracking để phát hiện scroll
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const isScrollingRef = useRef(false);
  const preventReactionClick = useRef(false);
  const menuOpenTimeRef = useRef<number>(0);

  // Selection store
  const {
    isSelectionMode,
    isMessageSelected,
    toggleMessage,
    enterSelectionMode,
  } = useSelectionStore();

  // Reply store
  const { setReplyMessage } = useReplyStore();

  const isSelected = isMessageSelected(msg.eventId);

  // Mock reactions data - in real app this would come from msg.reactions
  const reactions = [
    { emoji: "❤️", count: 2, userReacted: false },
    { emoji: "👍", count: 1, userReacted: false },
    { emoji: "😊", count: 3, userReacted: false },
    { emoji: "😢", count: 1, userReacted: false },
    { emoji: "😡", count: 1, userReacted: false },
  ];

  // Sync remaining when msg.audioDuration changes
  useEffect(() => {
    setRemaining(msg.audioDuration ?? 0);
  }, [msg.audioDuration]);

  const startCountdown = () => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!wavesurferRef.current) return;

    if (playing) {
      wavesurferRef.current.pause();
      stopCountdown();
    } else {
      wavesurferRef.current.play();
      startCountdown();
    }
    setPlaying((p) => !p);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Colors to match the design in the image
  const waveColor = "#e5e6e6"; // Light gray for inactive bars
  const progressColor = "#007aff"; // Blue for active/progress bars

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: waveColor,
        progressColor: progressColor,
        height: 24,
        barWidth: 3,
        responsive: true,
        interact: false,
        cursorWidth: 0,
      });

      wavesurferRef.current.load(msg.audioUrl ?? "");

      // Add event listeners
      wavesurferRef.current.on("finish", () => {
        setPlaying(false);
        stopCountdown();
        setRemaining(msg.audioDuration ?? 0);
      });

      wavesurferRef.current.on("pause", () => {
        setPlaying(false);
        stopCountdown();
      });

      wavesurferRef.current.on("play", () => {
        setPlaying(true);
        startCountdown();
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [msg.audioUrl]);

  // Handler functions from TextMessage
  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text || "Audio message");
    if (success) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy text");
    }
  };

  const handleForward = async () => {
    if (!msg.sender || !msg.time) return;

    // Đóng menu và reset vị trí
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

    // Add message to ForwardStore
    addMessage({
      text: "Audio message",
      senderId: msg.sender,
      sender: msg.senderDisplayName || msg.sender,
      time: msg.time,
    });
  };

  const handleReply = () => {
    if (!msg.sender || !msg.time) return;

    // Đóng menu
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

    // Set reply message
    setReplyMessage({
      eventId: msg.eventId,
      text: "Audio message",
      sender: msg.sender,
      senderDisplayName: msg.senderDisplayName || msg.sender,
      time: msg.time,
      type: msg.type,
    });
  };

  const handleDelete = async () => {
    if (!client || !roomId) return;
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
    // Kiểm tra timestamp - nếu menu vừa mở trong 700ms qua thì bỏ qua
    const timeSinceMenuOpen = Date.now() - menuOpenTimeRef.current;
    if (timeSinceMenuOpen < 700) {
      console.log(
        "Reaction click prevented - menu opened too recently:",
        timeSinceMenuOpen + "ms"
      );
      return;
    }

    // Ngăn click nếu vừa mới mở menu
    if (preventReactionClick.current) {
      console.log("Reaction click prevented - too soon after menu open");
      return;
    }

    // Handle reaction click - toggle user's reaction
    console.log(`Reaction clicked: ${emoji}`);
    // Đóng sự kiện click vào reaction
    if (open) {
      setOpen(false);
      setShowOverlay(false);
      setActiveMenuMessageId(null);
      setTransformOffset(0);
    }
  };

  const handleHoldStart = () => {
    // Nếu tin nhắn đã bị xóa thì không làm gì
    if (isDeleted) return;

    // Nếu đang scroll thì không kích hoạt hold
    if (isScrollingRef.current) return;

    holdTimeout.current = window.setTimeout(() => {
      // Double check không đang scroll trước khi hiện menu
      if (!isScrollingRef.current) {
        // Ngăn reaction click ngay lập tức
        preventReactionClick.current = true;
        setTimeout(() => {
          preventReactionClick.current = false;
        }, 600);

        // Hiển thị overlay ngay lập tức
        setShowOverlay(true);

        // Hiện reactions + dropdown menu
        allowOpenRef.current = true;
        calculateOptimalPosition();
      }
    }, 500); // Hold trong 500ms để hiện menu
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

    // Nếu đang scroll thì không xử lý click
    if (isScrollingRef.current) return;

    // Click không làm gì cả - menu chỉ mở qua hold gesture
  };

  // Xử lý touch events để phát hiện scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleted) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isScrollingRef.current = false;

    // Bắt đầu hold timer
    handleHoldStart();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDeleted || !touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Nếu di chuyển nhiều hơn 10px (đặc biệt là theo chiều dọc) thì coi như đang scroll
    if (deltaY > 10 || deltaX > 10) {
      isScrollingRef.current = true;
      handleHoldEnd(); // Cancel hold timer
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDeleted) return;

    handleHoldEnd();

    // Nếu không scroll và touch time ngắn thì coi như click
    if (!isScrollingRef.current && touchStartRef.current) {
      const touchTime = Date.now() - touchStartRef.current.time;
      if (touchTime < 300) {
        // Touch ngắn hơn 300ms = click
        setTimeout(() => {
          handleClick();
        }, 50); // Delay nhỏ để đảm bảo scroll detection hoàn tất
      }
    }

    touchStartRef.current = null;
    // Reset scroll flag sau một khoảng thời gian ngắn
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
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

    // Mở menu sau khi đã set transform và đảm bảo prevention đã được thiết lập
    setTimeout(() => {
      allowOpenRef.current = true;
      setOpen(true);
      setActiveMenuMessageId(msg.eventId);
      // Ghi nhận thời gian mở menu
      menuOpenTimeRef.current = Date.now();
      // Đảm bảo prevention vẫn hoạt động
      preventReactionClick.current = true;
      setTimeout(() => {
        preventReactionClick.current = false;
      }, 500); // Thêm 500ms nữa sau khi menu mở
    }, 200); // Tăng delay từ 150ms lên 200ms
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
      // Reset prevention flag và timestamp khi đóng menu
      preventReactionClick.current = false;
      menuOpenTimeRef.current = 0;
    }
  };

  const handleSelectionClick = () => {
    if (isDeleted) return;

    // Đóng menu và reset vị trí tin nhắn trước khi vào selection mode
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0); // Reset vị trí tin nhắn về ban đầu

    // Enter selection mode với message này
    enterSelectionMode(msg.eventId);
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
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
                  className={clsx(
                    "absolute top-[-50px] transform -translate-x-1/2 flex gap-1 justify-center z-[120]",
                    !isSender ? "left-23" : "-right-23"
                  )}
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
                          e.preventDefault();
                        }}
                        onTouchStart={(e) => {
                          console.log("Reaction touchStart!");
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onPointerDown={(e) => {
                          console.log("Reaction pointerDown!");
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          console.log("Reaction onClick!");
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
                        <span className="text-lg">{reaction.emoji}</span>
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
                    <div className="text-[#808080]/30 absolute left-[-7.6px] w-[16px] rotate-[-6deg]">
                      <BubbleTail isSender={false} fillColor="currentColor" />
                    </div>
                  )}

                  {/* 💬 Nội dung tin nhắn audio */}
                  <div className="flex flex-col">
                    <div
                      className={clsx(
                        "bg-[#808080]/30 dark:bg-[#808080] rounded-2xl p-3 w-45 max-w-xs flex flex-col select-none transition-all duration-200",
                        animate && "flash-background"
                      )}
                    >
                      {/* Audio player */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="rounded-full bg-[#000088] flex justify-center items-center w-10 h-10 text-white hover:bg-blue-600 transition-colors"
                        >
                          {playing ? (
                            <FaPause size={14} />
                          ) : (
                            <FaPlay size={14} className="ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div ref={waveformRef} className="w-full mb-1" />
                          <div className="flex items-center">
                            <span className="text-[10px] text-[#6B7271]">
                              {mm}:{ss}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time at bottom */}
                      <div className="flex justify-end mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-[#6B7271]">
                          <span>{formatMsgTime(msg.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🡒 Tail cho tin gửi */}
                  {isSender && (
                    <div
                      className={clsx(
                        "text-[#808080]/30 absolute bottom-[-2px] right-[-10px] w-[16px] rotate-[10deg]"
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
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={handleReply}
              >
                <span className="text-sm">Reply</span>
                <Reply size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={() => handleCopy("Audio message")}
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
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={handleSelectionClick}
              >
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

export default AudioMessage;
