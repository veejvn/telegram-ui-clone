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
// import { usePresenceContext } from "@/contexts/PresenceProvider";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useForwardStore } from "@/stores/useForwardStore";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import { useRouter } from "next/navigation";
import { useUserPresence } from "@/hooks/useUserPrecense";

const ChatHeader = ({ room }: { room: sdk.Room }) => {
  const client = useMatrixClient();
  // const { getLastSeen } = usePresenceContext() || {};
  const currentUserId = useAuthStore.getState().userId;

  const { roomId, type, otherUserId } = getRoomInfo(room, currentUserId);
  const clearMessages = useForwardStore((state) => state.clearMessages);

  const [user, setUser] = useState<sdk.User | undefined>(undefined);
  const router = useRouter();

  let lastSeen = null;
  if (client) {
    lastSeen = useUserPresence(client, user?.userId ?? "").lastSeen;
  }

  const isActuallyOnline =
    type === "direct" &&
    lastSeen !== null &&
    Date.now() - lastSeen.getTime() < 30 * 1000;

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

  const headerStyle = getHeaderStyleWithStatusBar();

  const backToMain = getLS("backToMain");
  const MAIN_APP_ORIGIN =
    typeof window !== "undefined" ? window.location.origin : "";
  const backUrl = getLS("backUrl");
  const handleBack = () => {
    if (backUrl) {
      removeLS("backUrl");
      removeLS("fromMainApp");
      removeLS("hide");
      removeLS("backToMain");
      window.location.href = MAIN_APP_ORIGIN + backUrl;
    } else {
      removeLS("backUrl");
      removeLS("fromMainApp");
      removeLS("hide");
      removeLS("backToMain");
      window.location.href = MAIN_APP_ORIGIN;
    }
  };

  return (
    <>
      <div
        style={headerStyle}
        className="flex items-center justify-between bg-gray-100 dark:bg-[#1b1a1f] py-1 px-2"
      >
        {/* Left: Back */}
        <div className="w-[80px] flex justify-start mt-2">
          {backToMain ? (
            <button
              className="flex flex-row text-blue-500 font-medium cursor-pointer"
              onClick={handleBack}
              title="Back"
              aria-label="Back"
            >
              <ChevronLeft />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href={"/chat"}
              className="flex text-blue-600 cursor-pointer hover:opacity-70"
              onClick={() => {
                setTimeout(() => {
                  clearMessages();
                }, 300);
              }}
            >
              <ChevronLeft />
              <p>Back</p>
            </Link>
          )}
        </div>

        {/* Center: Room Info */}
        <div className="flex-1 text-center truncate mt-1">
          <h1 className="font-semibold text-base -mb-2">{room.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {isActuallyOnline ? "online" : getDetailedStatus(lastSeen)}
          </p>
        </div>

        {/* Right: Avatar */}
        <div className="w-[80px] flex justify-end mt-1">
          <Link href={`${room.roomId}/info`}>
            <Avatar className="h-9 w-9">
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
