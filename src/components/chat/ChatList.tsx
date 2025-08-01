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
  Pin,
  Volume2,
  VolumeX,
  Trash2,
  Archive,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

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

  const handleMute = (roomId: string) => {
    setMutedRooms((prev) => {
      if (prev.includes(roomId)) {
        localStorage.removeItem(`mute-${roomId}`);
        return prev.filter((id) => id !== roomId);
      } else {
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
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY =
      "touches" in event ? event.touches[0].clientY : event.clientY;

    setActiveRoomId(roomId);
    setContextMenuPosition({ x: clientX, y: clientY });
    setShowContextMenu(true);
  };

  const startLongPress = (
    roomId: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(roomId, event);
    }, 500); // 500ms for better user experience (2s might feel too long)
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenuAction = (action: string) => {
    if (!activeRoomId) return;

    switch (action) {
      case "mark-read": // Handle mark as read
        break;
      case "pin": // Handle pin
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
              ); // If you want to use leading actions, uncomment and define leadingActions above. // Otherwise, remove the prop to fix the error.

              return (
                <SwipeableListItem
                  key={room.roomId}
                  trailingActions={trailingActions}
                >
                  <div
                    className="w-full hover:bg-white/30 rounded-l-lg active:bg-zinc-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
                    onMouseDown={(e) => startLongPress(room.roomId, e)}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    onTouchStart={(e) => startLongPress(room.roomId, e)}
                    onTouchEnd={endLongPress}
                  >
                    {isEditMode ? (
                      <ChatListItem
                        room={room}
                        isEditMode={isEditMode}
                        checked={selectedRooms.includes(room.roomId)}
                        onSelect={() => onSelectRoom?.(room.roomId)}
                        isMuted={mutedRooms.includes(room.roomId)}
                      />
                    ) : (
                      <Link
                        href={`/chat/${room.roomId}`}
                        onClick={endLongPress}
                      >
                        <div className="block w-full cursor-pointer">
                          <ChatListItem
                            room={room}
                            isMuted={mutedRooms.includes(room.roomId)}
                          />
                        </div>
                      </Link>
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
        {showContextMenu && (
          <div
            className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: Math.min(contextMenuPosition.y, window.innerHeight - 200),
              left: Math.min(contextMenuPosition.x, window.innerWidth - 180),
              width: "180px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full py-3 px-4 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("mark-read")}
            >
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>Mark as read</span>
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("pin")}
            >
              <Pin className="w-5 h-5 text-blue-500" />
              <span>Pin</span>
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => handleContextMenuAction("mute")}
            >
              {mutedRooms.includes(activeRoomId || "") ? (
                <>
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 text-blue-500" />
                  <span>Mute</span>
                </>
              )}
            </button>
            <button
              className="w-full py-3 px-4 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-700 text-red-500"
              onClick={() => handleContextMenuAction("delete")}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
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
