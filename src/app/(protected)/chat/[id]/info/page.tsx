"use client";
import InfoBody from "@/components/chat/InfoBody";
import GroupInfoBody from "@/components/chat/GroupInfoBody";
import GroupInfoHeader from "@/components/chat/GroupInfoHeader";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserInfoInPrivateRoom } from "@/services/chatService";
import PrivateInfoHeader from "@/components/chat/PrivateInfoHeader";
// import { getLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

export default function InfoPage() {
  const params = useParams();
  const roomId = decodeURIComponent(params.id as string);
  const client = useMatrixClient();
  const [user, setUser] = useState<sdk.User | undefined>(undefined);
  const [room, setRoom] = useState<sdk.Room | null>(null);
  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    if (!roomId || !client) return;

    // Get room object
    const roomObj = client.getRoom(roomId);
    if (roomObj) {
      setRoom(roomObj);

      // Check if it's a group chat
      const joinRuleEvent = roomObj.currentState.getStateEvents(
        "m.room.join_rules",
        ""
      );
      const joinRule = joinRuleEvent?.getContent()?.join_rule;
      const isGroupChat = joinRule === "public";
      setIsGroup(isGroupChat);

      // If it's a private chat, get user info
      if (!isGroupChat) {
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
      }
    }
  }, [roomId, client]);

  // Loading state
  if (!room || (isGroup ? false : !user)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M44 24c0-11.046-8.954-20-20-20v8a12 12 0 0112 12h8z"
          />
        </svg>
        <span className="text-lg text-gray-600 font-semibold">Loading...</span>
      </div>
    );
  }

  // Override backgroundColor về đen nếu có
  const headerStyleRaw = getHeaderStyleWithStatusBar();
  const headerStyle = { ...headerStyleRaw };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-cyan-700/30 via-cyan-300/15 to-yellow-600/25">
      <header style={headerStyle}>
        {isGroup ? (
          <GroupInfoHeader room={room} />
        ) : (
          <PrivateInfoHeader user={user!} />
        )}
      </header>
      <div>
        {isGroup ? <GroupInfoBody room={room} /> : <InfoBody user={user!} />}
      </div>
    </div>
  );
}
