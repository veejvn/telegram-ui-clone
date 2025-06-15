"use client"

import { Separator } from "@/components/ui/ChatSeparator";
import { ChatListItem } from "./ChatListItem";

import Link from "next/link";

import * as sdk from "matrix-js-sdk";

export const ChatList = ({ rooms }: { rooms: sdk.Room[] }) => {
  return (
    <>
      {rooms.map((room: sdk.Room) => (
        <div
          key={room.roomId}
          className="hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          <Link href={`/chat/${room.roomId}`}>
            <ChatListItem room={room} />
          </Link>
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