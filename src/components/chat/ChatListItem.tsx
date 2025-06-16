"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { getLastMessagePreview } from "@/utils/chat/getLastMessagePreview";
import { CheckCheck } from "lucide-react";
import * as sdk from "matrix-js-sdk";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useClientStore } from "@/stores/useClientStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

interface ChatListItemProps {
  room: sdk.Room;
  isEditMode?: boolean;
  checked?: boolean;
  onSelect?: () => void;
}

export const ChatListItem = ({
  room,
  isEditMode = false,
  checked = false,
  onSelect,
}: ChatListItemProps) => {
  const themes = useTheme();
  const client = useMatrixClient();

  // ⚡️ trigger render
  const [_, setRefresh] = useState(0);

  useEffect(() => {
    if (!client) return;

    const onTimeline = (event: sdk.MatrixEvent, updatedRoom: sdk.Room) => {
      if (
        updatedRoom.roomId === room.roomId &&
        event.getType() === "m.room.message"
      ) {
        setRefresh((prev) => prev + 1); // force update
      }
    };

    client.on("Room.timeline" as any, onTimeline);
    return () => {
      client.removeListener("Room.timeline" as any, onTimeline);
    };
  }, [client, room.roomId]);

  const avatarUrl = room.getAvatarUrl(
    "https://matrix.org",
    60,
    60,
    "crop",
    false
  );
  const { content, time, sender } = getLastMessagePreview(room);

  return (
    <div className="flex px-2 py-2 items-center">
      {isEditMode && (
  <input
    type="checkbox"
    className="mr-3 w-5 h-5"
    checked={checked}
    onChange={onSelect}
    onClick={e => e.stopPropagation()}
  />
)}

      <div className="w-[60px] flex justify-center items-center">
        <Avatar className="h-15 w-15">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="avatar" />
          ) : (
            <>
              <AvatarImage src="" alt="Unknow Avatar" />
              <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
                {room.name.slice(0, 1)}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      <div className="flex-1 ps-2.5">
        <h1 className="text-[18px] mb-0.5">{room.name}</h1>
        <p className="text-sm ">{sender}</p>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>

      <div className="flex gap-1 text-sm">
        <CheckCheck
          className={
            themes.theme === "dark"
              ? "h-4 w-4 mt-0.5 text-blue-600"
              : "h-4 w-4 mt-0.5 text-green-600"
          }
        />
        <span className="text-muted-foreground">{time}</span>
      </div>
    </div>
  );
};