"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { getLastMessagePreview } from "@/utils/chat/getLastMessagePreview";
import { CheckCheck, VolumeX } from "lucide-react";
import * as sdk from "matrix-js-sdk";
import React, { useEffect, useState } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import UnreadMsgsCount from "./UnreadMsgsCount";
import useUnreadMessages from "@/hooks/useUnreadMsgs";

import { Check } from "lucide-react";
import { useReadReceipts } from "@/hooks/useReadReceipts ";
import { truncateText } from "@/utils/chat/truncateText";

interface ChatListItemProps {
  room: sdk.Room;
  isEditMode?: boolean;
  checked?: boolean;
  onSelect?: () => void;
  isMuted?: boolean;
}

export const ChatListItem = ({
  room,
  isEditMode = false,
  checked = false,
  onSelect,
  isMuted = false,
}: ChatListItemProps) => {
  const client = useMatrixClient();
  const userId = client?.getUserId();
  const HOMESERVER_URL: string =
    process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.teknix.dev";

  // ⚡️ trigger render
  const [_, setRefresh] = useState(0);

  const unreadMsgs = useUnreadMessages(room);

  const lastReadReceipts = useReadReceipts(room);

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

    const onPresence = (event: any, member: any) => {
      if (room.getJoinedMembers().some((m) => m.userId === member.userId)) {
        setRefresh((prev) => prev + 1);
      }
    };

    client.on("Room.timeline" as any, onTimeline);
    client.on("RoomMember.presence" as any, onPresence);

    return () => {
      client.removeListener("Room.timeline" as any, onTimeline);
      client.removeListener("RoomMember.presence" as any, onPresence);
    };
  }, [client, room.roomId]);

  let avatarUrl = room.getAvatarUrl(HOMESERVER_URL, 60, 60, "crop", false);
  const members = room.getMembers();
  const isGroup = members.length > 2;
  if (!isGroup) {
    const otherMember = members.find((member) => member.userId !== userId);
    avatarUrl =
      otherMember?.getAvatarUrl(
        HOMESERVER_URL,
        60,
        60,
        "crop",
        false,
        true,
        false
      ) || "";
  }

  const { content, time, sender } = getLastMessagePreview(room);

  // Lấy userId của sender thực sự của tin nhắn cuối cùng
  const timeline = room.getLiveTimeline().getEvents();
  const lastValidEvent = [...timeline].reverse().find((event) => {
    const type = event.getType();
    return type === "m.room.message" || type === "m.room.redaction";
  });

  const lastMessageSenderId = lastValidEvent?.getSender();

  return (
    <div className="flex px-2 py-2">
      {isEditMode && (
        <label className="mr-3 inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="hidden peer"
            checked={checked}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            aria-label="checkbox"
          />
          <div className="w-5 h-5 rounded-full border border-gray-400 peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
            {checked && <Check className="w-4 h-4 text-white" />}
          </div>
        </label>
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

      <div className="flex-1 ps-2.5 relative">
        <div className="flex items-center gap-1">
          <h1 className="text-[18px] mb-0.5">{room.name}</h1>
          {isMuted && <VolumeX className="w-4 h-4 text-zinc-400" />}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lastMessageSenderId === userId ? (
            <>
              <span className="text-black/80">You: </span>
              {truncateText(content || "")}
            </>
          ) : (
            <>
              <span className="text-black/80">{sender}: </span>
              {truncateText(content || "")}
            </>
          )}
        </p>
        <div className="flex flex-col justify-between pb-1.5 absolute right-0 top-0 h-full items-end">
          <span className="text-xs text-gray-400 mb-1">{time}</span>
          {/* Tick hoặc badge unread */}
          {lastMessageSenderId === userId ? (
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full mt-1 ${
                lastReadReceipts ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </span>
          ) : (
            unreadMsgs &&
            unreadMsgs.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[10px] font-bold mt-1">
                {unreadMsgs.length}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};
