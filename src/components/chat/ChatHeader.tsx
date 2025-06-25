"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { formatRelativeTime } from "@/utils/chat/formatRelativeTime";
import { useChatStore } from "@/stores/useChatStore";

const ChatHeader = ({ room }: { room: sdk.Room }) => {
  const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
  const client = useMatrixClient();
  const lastSeenByRoom = useChatStore((state) => state.lastSeenByRoom);
  const myUserId = client?.getUserId();
  const roomId = room.roomId;
  const others = room.getJoinedMembers().filter(m => m.userId !== myUserId);
  const lastSeenMap = lastSeenByRoom[roomId] || {};

  const avatarUrl = room.getAvatarUrl(
    HOMESERVER_URL, // baseUrl
    60, // width
    60, // height
    "crop", // resize method
    false // fallback
  );

  return (
    <>
      <div
        className="flex justify-between bg-white dark:bg-[#1c1c1e]
          py-2 items-center px-2 "
      >
        <Link
          href={"/chat"}
          className="flex text-blue-600
            cursor-pointer hover:opacity-70"
        >
          <ChevronLeft />
          <p>Back</p>
        </Link>
        <div className="text-center">
          <h1 className="font-semibold text-base">{room.name}</h1>
          {others.map(({ userId }) => {
            const ts = lastSeenMap[userId];
            return (
              <div key={userId}>
                <p className="text-sm text-muted-foreground">
                  {ts ? formatRelativeTime(new Date(ts)) : "Chưa hoạt động"}
                </p>
              </div>
            );
          })}
        </div>
        <div>
          <Link href={`${room.roomId}/info`}>
            <Avatar className="h-10 w-10">
              {avatarUrl ? (
                <AvatarImage src="" alt="avatar" />
              ) : (
                <>
                  <AvatarImage src="" alt="Unknow" />
                  <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
                    {room.name.slice(0, 1)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
