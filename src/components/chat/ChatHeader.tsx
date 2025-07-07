"use client";

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
import { getUserInfoInPrivateRoom } from "@/services/chatService";
import { getRoomInfo } from "@/utils/chat/RoomHelpers";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePresenceContext } from "@/contexts/PresenceProvider";
import { getLS } from "@/tools/localStorage.tool";

const ChatHeader = ({ room }: { room: sdk.Room }) => {
  const client = useMatrixClient();
  const { getLastSeen } = usePresenceContext() || {};
  const currentUserId = useAuthStore.getState().userId;
  const { roomId, type, otherUserId } = getRoomInfo(room, currentUserId);

  const [user, setUser] = useState<sdk.User | undefined>(undefined);

  let lastSeen: Date | null = null;

  if (type === "direct" && otherUserId && getLastSeen) {
    lastSeen = getLastSeen(otherUserId);
  }

  const getDetailedStatus = () => {
    if (lastSeen) {
      const now = new Date();
      const diffMs = now.getTime() - lastSeen.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return "online";
      if (diffMinutes < 60) return `Last seen ${diffMinutes} minutes ago`;
      if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
      return "Last seen recently";
      // if (diffDays < 7) return `Last seen ${diffDays} days ago`;
    }
    return "Last seen recently";
  };

  useEffect(() => {
    if (!roomId || !client) return;

    getUserInfoInPrivateRoom(roomId, client)
      .then((res) => {
        if (res.success) {
          setUser(res.user);
        } else {
          console.log("Error: ", res.err);
        }
      })
      .catch((res) => {
        console.log("Error: ", res.err);
      });
  }, [roomId, client]);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!client || !user || !user.avatarUrl) return;
      try {
        const httpUrl =
          client.mxcUrlToHttp(user.avatarUrl, 96, 96, "crop") ?? "";
        setAvatarUrl(httpUrl);
      } catch (error) {
        setAvatarUrl("");
        console.error("Error loading avatar:", error);
      }
    };

    fetchAvatar();
  }, [client, user]);

  const statusBarHeight = getLS("statusBarHeight");

  const headerStyle = {
    paddingTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };

  return (
    <>
      <div
        style={headerStyle}
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
          <div>
            <p className="text-sm text-muted-foreground">
              {getDetailedStatus()}
            </p>
          </div>
        </div>
        <div>
          <Link href={`${room.roomId}/info`}>
            <Avatar className="h-10 w-10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="avatar" />
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
