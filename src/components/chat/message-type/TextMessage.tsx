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
import { useReplyStore } from "@/stores/useReplyStore";
import { usePinStore } from "@/stores/usePinStore";
import { useEditStore } from "@/stores/useEditStore";
import {
  pinMessage,
  unpinMessage,
  isMessagePinned,
} from "@/services/pinService";

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

  // Pin store
  const {
    pinMessage: pinToStore,
    unpinMessage: unpinFromStore,
    isMessagePinned: isPinnedInStore,
  } = usePinStore();

  // Edit store
  const { setEditMessage } = useEditStore();

  const isSelected = isMessageSelected(msg.eventId);

  // Use reactive store subscription for pin status
  const isPinned = usePinStore((state) =>
    state.isMessagePinned(roomId || "", msg.eventId)
  );

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
    // Đóng menu và reset vị trí trước khi copy
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

    const success = await copyToClipboard(text);
    if (success) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy text");
    }
  };

  const handleForward = async () => {
    if (!msg.text || !msg.sender || !msg.time || !client) return;

    // Đóng menu và reset vị trí trước khi navigate
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

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

  const handleReply = () => {
    if (!msg.text || !msg.sender || !msg.time) return;

    // Đóng menu và reset vị trí
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

    // Set reply message
    setReplyMessage({
      eventId: msg.eventId,
      text: msg.text,
      sender: msg.sender,
      senderDisplayName: msg.senderDisplayName || msg.sender,
      time: msg.time,
      type: msg.type,
    });
  };

  const handleDelete = async () => {
    if (!client || !roomId) return;

    // Đóng menu và reset vị trí trước khi delete
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

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

        // Set flag và trigger mở menu thông qua handleOpenChange
        allowOpenRef.current = true;
        handleOpenChange(true);
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
    // Selection mode chỉ hoạt động qua "Select" button trong menu
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

  const calculateOptimalPosition = (shouldOpenMenu = true) => {
    const messageElement = document.querySelector(
      `[data-message-id="${msg.eventId}"]`
    );
    if (!messageElement) {
      // Fallback: mở menu ngay nếu không tìm thấy element và shouldOpenMenu = true
      if (shouldOpenMenu) {
        allowOpenRef.current = true;
        setOpen(true);
        setActiveMenuMessageId(msg.eventId);
      }
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

    // Chỉ mở menu nếu shouldOpenMenu = true
    if (shouldOpenMenu) {
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
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleted || isSelectionMode) return;
    if (nextOpen) {
      // Chỉ cho phép mở nếu không ở selection mode
      if (allowOpenRef.current && !isSelectionMode) {
        // Gọi calculateOptimalPosition để tính toán vị trí tin nhắn trước khi mở menu
        calculateOptimalPosition(false); // false để không mở menu tự động

        // Sau đó mở menu
        setTimeout(() => {
          setOpen(true);
          setActiveMenuMessageId(msg.eventId);
          // Ghi nhận thời gian mở menu
          menuOpenTimeRef.current = Date.now();
          // Đảm bảo prevention vẫn hoạt động
          preventReactionClick.current = true;
          setTimeout(() => {
            preventReactionClick.current = false;
          }, 500);
        }, 200);

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

  const handleEdit = () => {
    if (!msg.text || !roomId || isDeleted) return;

    // Đóng menu và reset vị trí
    setOpen(false);
    setShowOverlay(false);
    setActiveMenuMessageId(null);
    setTransformOffset(0);

    // Set edit message
    setEditMessage({
      eventId: msg.eventId,
      text: msg.text,
      roomId: roomId,
    });
  };

  const handlePin = async () => {
    if (!client || !roomId || isDeleted) return;

    try {
      if (isPinned) {
        // Unpin message
        const result = await unpinMessage(client, roomId, msg.eventId);
        if (result.success) {
          unpinFromStore(roomId, msg.eventId);
        } else {
          console.error(result.error || "Failed to unpin message");
          //toast.error(result.error || "Failed to unpin message");
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
          console.error(result.error || "Failed to pin message");
          //toast.error(result.error || "Failed to pin message");
        }
      }

      // Đóng menu sau khi pin/unpin
      setOpen(false);
      setShowOverlay(false);
      setActiveMenuMessageId(null);
      setTransformOffset(0);
    } catch (error) {
      console.error("Error handling pin:", error);
      //toast.error("Failed to pin/unpin message");
    }
  };

  // Không cần useEffect để tính toán lại vị trí khi edit
  // Vì logic đã được xử lý trong handleEdit

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
                    "absolute top-[-45px] transform -translate-x-1/2 flex gap-1 justify-center z-[120]",
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
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          console.log("Reaction BUTTON clicked!");
                          e.stopPropagation();
                          e.preventDefault();

                          // Thêm delay nhỏ để đảm bảo không click ngay lập tức
                          setTimeout(() => {
                            handleReactionClick(reaction.emoji);
                          }, 50);
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
                        className={clsx(
                          "py-2 whitespace-pre-wrap break-words leading-snug select-none",
                          msg.isEdited && "text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {linkify(msg.text)}
                      </p>

                      <div className={timeClass}>
                        {msg.isEdited && (
                          <span className="text-[10px] text-gray-500 ml-2">
                            edited
                          </span>
                        )}
                        {formatMsgTime(msg.time)}
                      </div>
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
              className="mx-2 w-[192px] rounded-3xl relative z-[120]"
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
                onClick={() => handleCopy(msg.text)}
              >
                <span className="text-sm">Copy</span>
                <Copy size={16} className="text-blue-500" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Chỉ hiển thị Edit cho tin nhắn của chính mình */}
              {isSender && (
                <>
                  <DropdownMenuItem
                    className="flex justify-between items-center py-1"
                    onClick={handleEdit}
                  >
                    <span className="text-sm">Edit</span>
                    <Edit size={16} className="text-blue-500" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="flex justify-between items-center py-1"
                onClick={handlePin}
              >
                <span className="text-sm">{isPinned ? "Unpin" : "Pin"}</span>
                <Pin
                  size={16}
                  className={isPinned ? "text-red-500" : "text-blue-500"}
                />
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

export default TextMessage;
