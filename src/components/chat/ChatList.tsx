/*chatlist.tsx*/
"use client";

import { Separator } from "@/components/ui/ChatSeparator";
import { ChatListItem } from "./ChatListItem";
import Link from "next/link";
import * as sdk from "matrix-js-sdk";
import {
  SwipeableList,
  SwipeableListItem,
  LeadingActions,
  SwipeAction,
  Type as SwipeableListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Volume2,
  VolumeX,
  Trash2,
  Archive,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

interface ChatListProps {
  rooms: sdk.Room[];
  isEditMode?: boolean;
  selectedRooms?: string[];
  onSelectRoom?: (roomId: string) => void;
  onMute?: (roomId: string) => void;
  onDelete?: (roomId: string, type: "me" | "both") => void;
  onArchive?: (roomId: string) => void;
}

export const ChatList = ({
  rooms,
  isEditMode = false,
  selectedRooms = [],
  onSelectRoom,
  onMute,
  onDelete,
  onArchive,
}: ChatListProps) => {
  const client = useMatrixClient();
  const [mutedRooms, setMutedRooms] = useState<string[]>([]);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [deleteRoomName, setDeleteRoomName] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [activeItemElement, setActiveItemElement] =
    useState<HTMLElement | null>(null);
  const [pinnedRooms, setPinnedRooms] = useState<string[]>([]);

  // Đọc pinnedRooms từ account_data khi component mount
  useEffect(() => {
    if (!client) return;

    // Lấy dữ liệu từ account_data
    const pinnedRoomsEvent = client.getAccountData(
      "im.chatapp.pinned_rooms" as keyof sdk.AccountDataEvents
    );
    if (pinnedRoomsEvent) {
      const data = pinnedRoomsEvent.getContent();
      setPinnedRooms(data.rooms || []);
      console.log("Loaded pinned rooms:", data.rooms);
    }

    // Lắng nghe sự kiện khi pinnedRooms thay đổi (từ thiết bị khác)
    const onAccountData = (event: any) => {
      if (event.getType() === "im.chatapp.pinned_rooms") {
        const data = event.getContent();
        setPinnedRooms(data.rooms || []);
        console.log("Pinned rooms updated:", data.rooms);
      }
    };

    client.on("accountData" as any, onAccountData);

    return () => {
      client.removeListener("accountData" as any, onAccountData);
    };
  }, [client]);
  useEffect(() => {
    if (!client) return;

    // Đăng ký listener cho sự kiện Room.timeline để kiểm tra tin nhắn mới
    const handleNewMessage = (
      event: any,
      room: sdk.Room,
      toStartOfTimeline: boolean,
      removed: boolean,
      data: { liveEvent: boolean }
    ) => {
      // Chỉ xử lý tin nhắn mới và là tin nhắn văn bản
      if (
        !toStartOfTimeline &&
        data.liveEvent &&
        event.getType() === "m.room.message"
      ) {
        // Kiểm tra xem phòng chat có bị mute hay không
        if (mutedRooms.includes(room.roomId)) {
          // Nếu phòng đã mute, chặn thông báo ở đây
          // Có thể chặn bằng cách gọi stopPropagation hoặc preventDefault nếu cần
          console.log("Blocked notification from muted room:", room.name);

          // Matrix sử dụng một cơ chế khác để gửi thông báo,
          // nên ta cần đặt thuộc tính để chặn thông báo ở lớp cao hơn
          event._notificationSuppressed = true;
        }
      }
    };

    // Đăng ký listener
    client.on("Room.timeline" as any, handleNewMessage);

    // Hủy đăng ký khi component unmount
    return () => {
      client.removeListener("Room.timeline" as any, handleNewMessage);
    };
  }, [client, mutedRooms]);
  // Cập nhật hàm handleMute
  const handleMute = (roomId: string) => {
    setMutedRooms((prev) => {
      const isMuted = prev.includes(roomId);

      if (isMuted) {
        // Unmute - Xóa khỏi localStorage và state
        localStorage.removeItem(`mute-${roomId}`);
        return prev.filter((id) => id !== roomId);
      } else {
        // Mute - Thêm vào localStorage và state
        localStorage.setItem(
          `mute-${roomId}`,
          JSON.stringify({ isMuted: true, muteUntil: null })
        );
        return [...prev, roomId];
      }
    });

    onMute?.(roomId);
  };

  const handleLongPress = (
    roomId: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();

    // Lấy phần tử chứa toàn bộ đoạn chat (bao gồm avatar)
    // Tìm phần tử cha là SwipeableListItem
    let target = event.currentTarget as HTMLElement;

    // Đảm bảo target không null
    if (target) {
      // Tìm phần tử chứa ChatListItem
      const chatItem = target.querySelector(".block.w-full") || target;
      setActiveItemElement(chatItem as HTMLElement);

      setActiveRoomId(roomId);
      setShowContextMenu(true);
    } else {
      console.error("Target element is null");
    }
  };

  const startLongPress = (
    roomId: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    const target = event.currentTarget as HTMLElement;

    if (target) {
      // Lưu lại target trước khi setTimeout
      setActiveItemElement(target);
      setActiveRoomId(roomId);

      longPressTimerRef.current = setTimeout(() => {
        setShowContextMenu(true);
      }, 500);
    } else {
      console.error("Target element is null in startLongPress");
    }
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const togglePinnedRoom = (roomId: string) => {
    if (!client || !roomId) return;

    const newPinnedRooms = pinnedRooms.includes(roomId)
      ? pinnedRooms.filter((id) => id !== roomId)
      : [...pinnedRooms, roomId];

    client
      .setAccountData(
        "im.chatapp.pinned_rooms" as keyof sdk.AccountDataEvents,
        {
          rooms: newPinnedRooms,
        }
      )
      .then(() => {
        setPinnedRooms(newPinnedRooms);
      })
      .catch((error) => {
        console.error("Error toggling pinned room:", error);
      });
  };

  const MarkAsReadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.46875 7.5C5.46875 7.57459 5.43912 7.64613 5.38637 7.69887C5.33363 7.75162 5.26209 7.78125 5.1875 7.78125C5.11291 7.78125 5.04137 7.75162 4.98863 7.69887C4.93588 7.64613 4.90625 7.57459 4.90625 7.5C4.90625 7.42541 4.93588 7.35387 4.98863 7.30113C5.04137 7.24838 5.11291 7.21875 5.1875 7.21875C5.26209 7.21875 5.33363 7.24838 5.38637 7.30113C5.43912 7.35387 5.46875 7.42541 5.46875 7.5ZM5.46875 7.5H5.1875M8.28125 7.5C8.28125 7.57459 8.25162 7.64613 8.19887 7.69887C8.14613 7.75162 8.07459 7.78125 8 7.78125C7.92541 7.78125 7.85387 7.75162 7.80113 7.69887C7.74838 7.64613 7.71875 7.57459 7.71875 7.5C7.71875 7.42541 7.74838 7.35387 7.80113 7.30113C7.85387 7.24838 7.92541 7.21875 8 7.21875C8.07459 7.21875 8.14613 7.24838 8.19887 7.30113C8.25162 7.35387 8.28125 7.42541 8.28125 7.5ZM8.28125 7.5H8M11.0938 7.5C11.0938 7.57459 11.0641 7.64613 11.0114 7.69887C10.9586 7.75162 10.8871 7.78125 10.8125 7.78125C10.7379 7.78125 10.6664 7.75162 10.6136 7.69887C10.5609 7.64613 10.5312 7.57459 10.5312 7.5C10.5312 7.42541 10.5609 7.35387 10.6136 7.30113C10.6664 7.24838 10.7379 7.21875 10.8125 7.21875C10.8871 7.21875 10.9586 7.24838 11.0114 7.30113C11.0641 7.35387 11.0938 7.42541 11.0938 7.5ZM11.0938 7.5H10.8125M14.75 7.5C14.75 10.917 11.7275 13.6875 8 13.6875C7.35289 13.6883 6.70853 13.6033 6.08375 13.4348C5.20307 14.0541 4.12874 14.3356 3.0575 14.2275C2.9384 14.216 2.8198 14.1997 2.702 14.1788C3.07165 13.7431 3.3241 13.2204 3.4355 12.66C3.503 12.3172 3.33575 11.9842 3.08525 11.7405C1.9475 10.6335 1.25 9.14175 1.25 7.5C1.25 4.083 4.2725 1.3125 8 1.3125C11.7275 1.3125 14.75 4.083 14.75 7.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const PinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.8316 4.00954L9.92789 0.105814C9.78697 -0.0352509 9.55815 -0.0352509 9.41723 0.105814L9.40069 0.122354C9.16132 0.361651 9.02943 0.679968 9.02943 1.01844C9.02943 1.2365 9.08483 1.44575 9.18776 1.63131L5.10317 5.13683C4.79056 4.85745 4.39156 4.70454 3.96894 4.70454C3.51353 4.70454 3.08543 4.88186 2.7635 5.20386L2.73901 5.22835C2.59795 5.36934 2.59795 5.59802 2.73901 5.73901L5.07767 8.07766L2.79998 10.3553C2.7544 10.4022 1.6763 11.5131 0.967508 12.3972C0.292521 13.2389 0.15904 13.3931 0.152106 13.4011C0.0267876 13.5438 0.0337217 13.759 0.167852 13.8938C0.238132 13.9644 0.330803 14.0001 0.423762 14.0001C0.508488 14.0001 0.59343 13.9705 0.661759 13.9107C0.667754 13.9055 0.818425 13.7746 1.66561 13.0953C2.54956 12.3865 3.66052 11.3084 3.71101 11.2592L5.98502 8.98516L8.19843 11.1986C8.26892 11.2691 8.36138 11.3044 8.45376 11.3044C8.54614 11.3044 8.63867 11.2691 8.70909 11.1986L8.73358 11.1741C9.05558 10.8522 9.2329 10.424 9.2329 9.96864C9.2329 9.54602 9.07992 9.14703 8.80061 8.83441L12.3061 4.74982C12.4917 4.85275 12.7009 4.90815 12.919 4.90815C13.2575 4.90815 13.5758 4.77633 13.8151 4.53689L13.8316 4.52035C13.9727 4.37921 13.9727 4.15053 13.8316 4.00954Z"
        fill="currentColor"
      />
    </svg>
  );

  const handleContextMenuAction = (action: string) => {
    if (!activeRoomId) return;

    switch (action) {
      case "mark-read":
        if (!client || !activeRoomId) return;

        const room = client.getRoom(activeRoomId);
        if (!room) return;

        // Lấy timeline events của phòng
        const timelineEvents = room.getLiveTimeline().getEvents();

        // Tìm event cuối cùng (nếu có)
        if (timelineEvents.length > 0) {
          const latestEvent = timelineEvents[timelineEvents.length - 1];

          // Đặt fully-read marker và read receipt tại sự kiện mới nhất
          client
            .setRoomReadMarkers(
              activeRoomId,
              latestEvent.getId() || "", // fully-read marker
              latestEvent // read receipt (pass the MatrixEvent object)
            )
            .then(() => {
              console.log("Room marked as read:", activeRoomId);
              // Force re-render để cập nhật UI
              setMutedRooms([...mutedRooms]);
            })
            .catch((error) => {
              console.error("Error marking room as read:", error);
            });
        }
        break;
      case "pin":
        if (!client) return;

        // Toggle pin status
        const newPinnedRooms = pinnedRooms.includes(activeRoomId)
          ? pinnedRooms.filter((id) => id !== activeRoomId) // Unpin
          : [...pinnedRooms, activeRoomId]; // Pin

        // Lưu vào account_data trên server
        client
          .setAccountData(
            "im.chatapp.pinned_rooms" as keyof sdk.AccountDataEvents,
            {
              rooms: newPinnedRooms,
            }
          )
          .then(() => {
            // Cập nhật state local sau khi lưu thành công
            setPinnedRooms(newPinnedRooms);
          })
          .catch((error) => {
            console.error("Error saving pinned rooms:", error);
          });
        break;
      case "mute":
        handleMute(activeRoomId);
        break;
      case "delete":
        setDeleteRoomId(activeRoomId);
        setDeleteRoomName(
          rooms.find((r) => r.roomId === activeRoomId)?.name || ""
        );
        break;
    }
    setShowContextMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showContextMenu) setShowContextMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showContextMenu]);

  React.useEffect(() => {
    const muted: string[] = [];
    rooms.forEach((room) => {
      const stored = localStorage.getItem(`mute-${room.roomId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.isMuted) muted.push(room.roomId);
        } catch {}
      }
    });
    setMutedRooms(muted);
  }, [rooms]);

  return (
    <>
      <div className="flex flex-col pb-30 spacy-y-2 px-3.5">
        <SwipeableList fullSwipe={false} type={SwipeableListType.IOS}>
          {rooms
            .filter((room) => !!room && !!room.roomId)
            // Sắp xếp các phòng đã ghim lên đầu
            .sort((a, b) => {
              const isPinnedA = pinnedRooms.includes(a.roomId);
              const isPinnedB = pinnedRooms.includes(b.roomId);

              if (isPinnedA && !isPinnedB) return -1;
              if (!isPinnedA && isPinnedB) return 1;
              return 0;
            })
            .map((room: sdk.Room, idx) => {
              // Trailing actions: More, Delete, Archive
              const containerStyle =
                "h-full flex items-center px-[2px] justify-between w-[280px]"; // Tăng chiều rộng container
              const actionButtonStyle =
                "w-[70px] h-[64px] flex flex-col items-center justify-center bg-[#FAF9EE] rounded-[16px] shadow-sm mx-[2px]";
              const iconClass = "w-[20px] h-[20px]";
              const labelClass =
                "text-[11px] font-medium mt-[6px] whitespace-nowrap overflow-hidden";

              const trailingActions = (
                <div className={containerStyle}>
                  <SwipeAction
                    onClick={() => {
                      setShowContextMenu(true);
                      setActiveRoomId(room.roomId);
                    }}
                  >
                    <div className={actionButtonStyle}>
                      <MoreHorizontal
                        className={`${iconClass} text-gray-700`}
                      />
                      <span className={`${labelClass} text-gray-700`}>
                        More
                      </span>
                    </div>
                  </SwipeAction>
                  <SwipeAction
                    onClick={() => {
                      setDeleteRoomId(room.roomId);
                      setDeleteRoomName(room.name);
                    }}
                  >
                    <div className={actionButtonStyle}>
                      <Trash2 className={`${iconClass} text-red-500`} />
                      <span className={`${labelClass} text-red-500`}>
                        Delete
                      </span>
                    </div>
                  </SwipeAction>
                  <SwipeAction onClick={() => onArchive?.(room.roomId)}>
                    <div className={actionButtonStyle}>
                      <Archive className={`${iconClass} text-blue-500`} />
                      <span className={`${labelClass} text-blue-500`}>
                        Archive
                      </span>
                    </div>
                  </SwipeAction>
                </div>
              );

              return (
                <SwipeableListItem
                  key={room.roomId}
                  trailingActions={trailingActions}
                >
                  <div
                    className={`w-full ${
                      pinnedRooms.includes(room.roomId)
                        ? "bg-[#f7f9fa] border border-[#e3e4e4] bg-opacity-30 shadow-[0_0_4px_rgba(0,0,0,0.05)]"
                        : "hover:bg-white/30"
                    } rounded-lg active:bg-zinc-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-700`}
                    onMouseDown={(e) => startLongPress(room.roomId, e)}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    onTouchStart={(e) => startLongPress(room.roomId, e)}
                    onTouchEnd={endLongPress}
                  >
                    {/* Nội dung hiện tại */}
                    {isEditMode ? (
                      <ChatListItem
                        room={room}
                        isEditMode={isEditMode}
                        checked={selectedRooms.includes(room.roomId)}
                        onSelect={() => onSelectRoom?.(room.roomId)}
                        isMuted={mutedRooms.includes(room.roomId)}
                        isPinned={pinnedRooms.includes(room.roomId)}
                      />
                    ) : (
                      <div
                        className="block w-full cursor-pointer"
                        onMouseDown={(e) => startLongPress(room.roomId, e)}
                        onMouseUp={endLongPress}
                        onMouseLeave={endLongPress}
                        onTouchStart={(e) => startLongPress(room.roomId, e)}
                        onTouchEnd={endLongPress}
                      >
                        <Link
                          href={`/chat/${room.roomId}`}
                          onClick={(e) => {
                            if (longPressTimerRef.current) {
                              e.preventDefault();
                              endLongPress();
                            }
                          }}
                        >
                          <ChatListItem
                            room={room}
                            isMuted={mutedRooms.includes(room.roomId)}
                            isPinned={pinnedRooms.includes(room.roomId)}
                          />
                        </Link>
                      </div>
                    )}
                    {rooms.length - 1 !== idx ? (
                      <Separator className="w-[calc(100%-72px)] ml-[72px] text-white bg-white shadow-sm" />
                    ) : (
                      <Separator className="text-white bg-white shadow-sm" />
                    )}
                  </div>
                </SwipeableListItem>
              );
            })}
        </SwipeableList>
        {showContextMenu && activeItemElement && (
          <div
            className="fixed z-[9999] bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: activeItemElement.getBoundingClientRect().bottom, // Hiển thị dưới phần tử chat
              left: activeItemElement.getBoundingClientRect().left, // Căn trái với phần tử chat
              width: "150px",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="w-full py-2 px-3 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("mark-read")}
            >
              <span>Mark as read</span>
              <MarkAsReadIcon className="w-5 h-5 text-blue-500" />
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("pin")}
            >
              <span>
                {pinnedRooms.includes(activeRoomId || "") ? "Unpin" : "Pin"}
              </span>
              <PinIcon
                className={`w-5 h-5 ${
                  pinnedRooms.includes(activeRoomId || "")
                    ? "text-gray-500"
                    : "text-blue-500"
                }`}
              />
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("mute")}
            >
              <span>
                {mutedRooms.includes(activeRoomId || "") ? "Unmute" : "Mute"}
              </span>
              {mutedRooms.includes(activeRoomId || "") ? (
                <Volume2 className="w-5 h-5 text-blue-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-blue-500" />
              )}
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("delete")}
            >
              <span className="text-red-500">Delete</span>
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        )}
        {deleteRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-800 w-full max-w-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Permanently delete the chat with <b>{deleteRoomName}</b>?
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-2 text-red-500 font-semibold border-b"
                  onClick={() => {
                    onDelete?.(deleteRoomId, "me");
                    setDeleteRoomId(null);
                    setDeleteRoomName(null);
                  }}
                >
                  Delete just for me
                </button>
                <button
                  className="w-full py-2 text-blue-500 font-medium"
                  onClick={() => {
                    setDeleteRoomId(null);
                    setDeleteRoomName(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
