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
  isPinned?: boolean;
  customName?: string | { name: string };
  customAvatar?: string;
}

function getHttpAvatarUrl(
  client: sdk.MatrixClient | null,
  mxcUrl?: string | null
): string | undefined {
  if (!mxcUrl) return undefined; // loại bỏ luôn trường hợp null
  if (mxcUrl.startsWith("mxc://") && client) {
    return client.mxcUrlToHttp(mxcUrl, 60, 60, "crop", false) ?? undefined;
  }
  return mxcUrl ?? undefined;
}

export const ChatListItem = ({
  room,
  isEditMode = false,
  checked = false,
  onSelect,
  isMuted = false,
  isPinned = false,
  customAvatar,
  customName,
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

  const finalAvatar = getHttpAvatarUrl(client, customAvatar ?? avatarUrl);

  const { content, time, sender } = getLastMessagePreview(room);

  // Lấy userId của sender thực sự của tin nhắn cuối cùng
  const timeline = room.getLiveTimeline().getEvents();
  const lastValidEvent = [...timeline].reverse().find((event) => {
    const type = event.getType();
    return type === "m.room.message" || type === "m.room.redaction";
  });

  const lastMessageSenderId = lastValidEvent?.getSender();
  const PinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.8316 4.00954L9.92789 0.105814C9.78697 -0.0352509 9.55815 -0.0352509 9.41723 0.105814L9.40069 0.122354C9.16132 0.361651 9.02943 0.679968 9.02943 1.01844C9.02943 1.2365 9.08483 1.44575 9.18776 1.63131L5.10317 5.13683C4.79056 4.85745 4.39156 4.70454 3.96894 4.70454C3.51353 4.70454 3.08543 4.88186 2.7635 5.20386L2.73901 5.22835C2.59795 5.36934 2.59795 5.59802 2.73901 5.73901L5.07767 8.07766L2.79998 10.3553C2.7544 10.4022 1.6763 11.5131 0.967508 12.3972C0.292521 13.2389 0.15904 13.3931 0.152106 13.4011C0.0267876 13.5438 0.0337217 13.759 0.167852 13.8938C0.238132 13.9644 0.330803 14.0001 0.423762 14.0001C0.508488 14.0001 0.59343 13.9705 0.661759 13.9107C0.667754 13.9055 0.818425 13.7746 1.66561 13.0953C2.54956 12.3865 3.66052 11.3084 3.71101 11.2592L5.98502 8.98516L8.19843 11.1986C8.26892 11.2691 8.36138 11.3044 8.45376 11.3044C8.54614 11.3044 8.63867 11.2691 8.70909 11.1986L8.73358 11.1741C9.05558 10.8522 9.2329 10.424 9.2329 9.96864C9.2329 9.54602 9.07992 9.14703 8.80061 8.83441L12.3061 4.74982C12.4917 4.85275 12.7009 4.90815 12.919 4.90815C13.2575 4.90815 13.5758 4.77633 13.8151 4.53689L13.8316 4.52035C13.9727 4.37921 13.9727 4.15053 13.8316 4.00954Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="flex px-2 py-2 relative select-none">
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
          {finalAvatar ? (
            <AvatarImage src={finalAvatar} alt="avatar" />
          ) : (
            <>
              <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
                {room.name?.slice(0, 1) ?? "?"}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      <div className="flex-1 ps-2.5 relative">
        <div className="flex items-center gap-1">
          {isPinned && <PinIcon className="w-4 h-4 text-blue-500 ml-1" />}
          {isMuted && <VolumeX className="w-4 h-4 text-red-500" />}
          <h1 className="text-[18px] mb-0.5 select-none">
            {typeof customName === "object"
              ? customName.name
              : customName ?? room.name}
          </h1>
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
