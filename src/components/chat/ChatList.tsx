"use client"

import { Separator } from "@/components/ui/ChatSeparator";
import { ChatListItem } from "./ChatListItem";
import Link from "next/link";
import * as sdk from "matrix-js-sdk";

interface ChatListProps {
  rooms: sdk.Room[];
  isEditMode?: boolean;
  selectedRooms?: string[];
  onSelectRoom?: (roomId: string) => void;
}

export const ChatList = ({
  rooms,
  isEditMode = false,
  selectedRooms = [],
  onSelectRoom,
}: ChatListProps) => {
  return (
    <>
   {rooms
        .filter(room => !!room && !!room.roomId) 
        .map((room: sdk.Room) => (
        <div
          key={room.roomId}
          className="hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          {isEditMode ? (
            <ChatListItem
              room={room}
              isEditMode={isEditMode}
              checked={selectedRooms.includes(room.roomId)}
              onSelect={() => onSelectRoom?.(room.roomId)}
            />
          ) : (
            <Link href={`/chat/${room.roomId}`}>
              <ChatListItem room={room} />
            </Link>
          )}
          {rooms[rooms.length - 1] !== room ? (
            <Separator className="w-[calc(100%-72px)] ml-[72px]" />
          ) : (
            <Separator className="" />
          )}
        </div>
      ))}
    </>
  );
};