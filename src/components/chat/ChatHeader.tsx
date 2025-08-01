"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { ChevronLeft, PhoneOutgoing, Video } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserInfoInPrivateRoom } from "@/services/chatService";
import { getRoomInfo } from "@/utils/chat/RoomHelpers";
import { useAuthStore } from "@/stores/useAuthStore";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useForwardStore } from "@/stores/useForwardStore";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import { useRouter } from "next/navigation";
import { useUserPresence } from "@/hooks/useUserPrecense";
import useCallStore from "@/stores/useCallStore";

interface Contact {
  id: string;
  name: string;
  lastSeen: string;
  roomId: string;
}

const ChatHeader = ({ room }: { room: sdk.Room }) => {
  const client = useMatrixClient();
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

  // Create contact object like in NewCallPage
  const createContactFromUser = (): Contact | null => {
    if (!user || !room) return null;

    return {
      id: user.userId,
      name: user.displayName || user.userId || room.name,
      lastSeen: isActuallyOnline ? "online" : getDetailedStatus(lastSeen) || "recently",
      roomId: room.roomId,
    };
  };

  // Follow NewCallPage pattern - handle start call exactly the same way
  const handleStartCall = async (callType: 'voice' | 'video') => {
    if (!user || !room) return;

    const contact = createContactFromUser();
    if (!contact) return;

    try {
      // 🟢 Reset call state trước khi gọi - exactly like NewCallPage
      useCallStore.getState().reset();

      // Navigate exactly like NewCallPage
      router.push(
        `/call/${callType}?calleeId=${encodeURIComponent(contact.roomId)}&contact=${encodeURIComponent(contact.name)}`
      );
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const currentContact = createContactFromUser();

  return (
    <div className="flex items-center justify-between h-[50px] p-2">
      {/* Left: Back button */}
      <div className="w-[80px] flex justify-start">
        {backToMain ? (
          <button
            className="flex items-center justify-center font-medium cursor-pointer bg-white/60 rounded-full p-1.5 border border-white
          bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 
          backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
            onClick={handleBack}
            title="Back"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <Link
            href={"/chat"}
            className="flex items-center justify-center cursor-pointer hover:opacity-70 bg-white/60 rounded-full p-1 border border-white
          bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 
          backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
            onClick={() => {
              setTimeout(() => {
                clearMessages();
              }, 300);
            }}
          >
            <ChevronLeft size={20} />
          </Link>
        )}
      </div>

      {/* Center: Room name */}
      <div className="flex-1 text-center truncate">
        <Link href={`${room.roomId}/info`}>
          <h1 className="font-semibold">{room.name}</h1>
          <p className="text-xs text-muted-foreground truncate">
            {isActuallyOnline ? "online" : getDetailedStatus(lastSeen)}
          </p>
        </Link>
      </div>

      {/* Right: Call/Video buttons */}
      <div className="w-[80px] flex items-center gap-2 justify-end">
        {/* Video Call Button */}
        <button
          className="flex items-center justify-center rounded-full p-1 border border-white cursor-pointer 
        bg-gradient-to-br from-slate-100/70 via-gray-400/10 to-slate-50/30 backdrop-blur-xs 
        shadow-xs hover:scale-105 duration-300 transition-all ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={() => handleStartCall("video")}
          disabled={!user || !client || !currentContact}
          title="Video Call"
          aria-label="Start video call"
        >
          <Video size={20} />
        </button>

        {/* Voice Call Button */}
        <button
          className="flex items-center justify-center rounded-full p-1.5 border border-white cursor-pointer 
        bg-gradient-to-br from-slate-100/70 via-gray-400/10 to-slate-50/30 backdrop-blur-xs 
        shadow-xs hover:scale-105 duration-300 transition-all ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={() => handleStartCall("voice")}
          disabled={!user || !client || !currentContact}
          title="Voice Call"
          aria-label="Start voice call"
        >
          <PhoneOutgoing size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;