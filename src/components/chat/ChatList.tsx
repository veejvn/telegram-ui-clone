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

interface ChatListProps {
  rooms: sdk.Room[];
  isEditMode?: boolean;
  selectedRooms?: string[];
  onSelectRoom?: (roomId: string) => void;
  onMute?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
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
  return (
    <SwipeableList fullSwipe={false} type={SwipeableListType.IOS}>
      {rooms
        .filter((room) => !!room && !!room.roomId)
        .map((room: sdk.Room, idx) => {
          const actions = (
            <LeadingActions>
              <SwipeAction onClick={() => onMute?.(room.roomId)}>
                <div className="bg-yellow-400 w-[80px] h-full flex flex-col items-center justify-center border-r border-white">
                  <span className="text-2xl mb-1">🔇</span>
                  <span className="text-sm font-medium">Mute</span>
                </div>
              </SwipeAction>
              <SwipeAction onClick={() => onDelete?.(room.roomId)}>
                <div className="bg-red-500 text-white w-[80px] h-full flex flex-col items-center justify-center border-r border-white">
                  <span className="text-2xl mb-1">🗑️</span>
                  <span className="text-sm font-medium">Delete</span>
                </div>
              </SwipeAction>
              <SwipeAction onClick={() => onArchive?.(room.roomId)}>
                <div className="bg-gray-500 text-white w-[80px] h-full flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">🗄️</span>
                  <span className="text-sm font-medium">Archive</span>
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
                  />
                ) : (
                  <Link href={`/chat/${room.roomId}`}>
                    <div className="block w-full cursor-pointer">
                      <ChatListItem room={room} />
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
  );
};
