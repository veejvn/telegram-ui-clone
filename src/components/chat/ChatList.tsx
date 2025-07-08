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
import React, { useState } from "react";
import { Volume2, VolumeX, Trash2, Archive } from "lucide-react";
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

  const handleMute = (roomId: string) => {
    setMutedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
    onMute?.(roomId);
  };

  return (
    <>
      <ScrollArea tabIndex={-1}>
        <div className="flex flex-col px-2 pb-[64px] spacy-y-2">
          <SwipeableList fullSwipe={false} type={SwipeableListType.IOS}>
            {rooms
              .filter((room) => !!room && !!room.roomId)
              .map((room: sdk.Room, idx) => {
                const actions = (
                  <LeadingActions>
                    <SwipeAction onClick={() => handleMute(room.roomId)}>
                      <div className="bg-[#ffcc00] w-[80px] h-full flex flex-col items-center justify-center text-center">
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          {mutedRooms.includes(room.roomId) ? (
                            <>
                              <Volume2 className="w-6 h-6 text-white mb-1" />
                              <span className="text-sm font-medium text-white">
                                Unmute
                              </span>
                            </>
                          ) : (
                            <>
                              <VolumeX className="w-6 h-6 text-white mb-1" />
                              <span className="text-sm font-medium text-white">
                                Mute
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </SwipeAction>

                    <SwipeAction
                      onClick={() => {
                        setDeleteRoomId(room.roomId);
                        setDeleteRoomName(room.name);
                      }}
                    >
                      <div className="bg-[#ff4d4f] w-[80px] h-full flex flex-col items-center justify-center text-center">
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          <Trash2 className="w-6 h-6 text-white mb-1" />
                          <span className="text-sm font-medium text-white">
                            Delete
                          </span>
                        </div>
                      </div>
                    </SwipeAction>

                    <SwipeAction onClick={() => onArchive?.(room.roomId)}>
                      <div className="bg-[#7a8a99] w-[80px] h-full flex flex-col items-center justify-center text-center">
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          <Archive className="w-6 h-6 text-white mb-1" />
                          <span className="text-sm font-medium text-white">
                            Archive
                          </span>
                        </div>
                      </div>
                    </SwipeAction>
                  </LeadingActions>
                );

                return (
                  <SwipeableListItem
                    key={room.roomId}
                    trailingActions={actions}
                    onSwipeStart={() => console.log("Swipe start")}
                    onSwipeEnd={() => console.log("Swipe end")}
                  >
                    <div className="w-full hover:bg-zinc-300 dark:hover:bg-zinc-700">
                      {isEditMode ? (
                        <ChatListItem
                          room={room}
                          isEditMode={isEditMode}
                          checked={selectedRooms.includes(room.roomId)}
                          onSelect={() => onSelectRoom?.(room.roomId)}
                          isMuted={mutedRooms.includes(room.roomId)}
                        />
                      ) : (
                        <Link href={`/chat/${room.roomId}`}>
                          <div className="block w-full cursor-pointer">
                            <ChatListItem
                              room={room}
                              isMuted={mutedRooms.includes(room.roomId)}
                            />
                            {/* THÊM Ở ĐÂY */}
                          </div>
                        </Link>
                      )}

                      {rooms.length - 1 !== idx ? (
                        <Separator className="w-[calc(100%-72px)] ml-[72px]" />
                      ) : (
                        <Separator />
                      )}
                    </div>
                  </SwipeableListItem>
                );
              })}
          </SwipeableList>
          {deleteRoomId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white w-full max-w-md rounded-lg p-6">
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
      </ScrollArea>
    </>
  );
};
