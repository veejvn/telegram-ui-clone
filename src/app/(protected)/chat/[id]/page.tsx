/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./page.module.css";
import { sendReadReceipt } from "@/services/chatService";
import { useUserStore } from "@/stores/useUserStore";
import { useIgnoreStore } from "@/stores/useIgnoreStore";

const ChatPage = () => {
  const { theme } = useTheme();
  const [joining, setJoining] = useState(false);
  const [room, setRoom] = useState<sdk.Room | null>();
  const param = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUserStore.getState().user;
  const client = useMatrixClient();
  const homeserver =
    user && user.homeserver
      ? user.homeserver.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "";
  const roomId = user ? param.id?.slice(0, 19) + ":" + homeserver : "";
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const ignoredUsers = useIgnoreStore((state) => state.ignoredUsers);

  // Kiểm tra xem người dùng có bị chặn không
  useEffect(() => {
    if (!client || !room || !room.getJoinedMembers) return;
    const members = room.getJoinedMembers();
    const otherUser = members.find((m) => m.userId !== client.getUserId());

    if (otherUser) {
      setIsBlocked(ignoredUsers.includes(otherUser.userId));
    }
  }, [client, room, ignoredUsers]);

  const handleUnblockUser = async () => {
    if (!client || !room) return;

    const members = room.getJoinedMembers();
    const otherUser = members.find((m) => m.userId !== client.getUserId());

    const ignored = client.getIgnoredUsers?.() || [];
    if (otherUser && ignored.includes(otherUser.userId)) {
      const updated = ignored.filter((id) => id !== otherUser.userId);
      await client.setIgnoredUsers(updated);
      useIgnoreStore.getState().setIgnoredUsers(updated);
    }
  };

  useEffect(() => {
    if (!client) return;

    const foundRoom = client.getRoom(roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, client]);

  useEffect(() => {
    if (!client || !room) return;
    const isInvite = room?.getMyMembership() === "invite";
    if(isInvite){
      joinRoom()
    }
    // Lấy event cuối cùng trong room (nếu có)
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;
    if (lastEvent) {
      sendReadReceipt(client, lastEvent);
    }
  }, [room, client]);

  if (!room) return null;
  // Kiểm tra trạng thái invite

  const joinRoom = async () => {
    if (!client) return;
    try {
      await client.joinRoom(roomId);

      // Đợi đến khi client sync xong
      await new Promise<void>((resolve) => {
        const onSync = (state: string) => {
          if (state === "SYNCING" || state === "PREPARED") {
            resolve();
            client.removeListener("sync" as any, onSync);
          }
        };
        client.on("sync" as any, onSync);
      });

      // Lấy lại room sau khi sync
      const joinedRoom = client.getRoom(roomId);
      if (joinedRoom) {
        setRoom(joinedRoom);
      } else {
        toast.error("Không thể load dữ liệu phòng sau khi tham gia.");
      }
    } catch (e) {
      toast.error("Không thể tham gia phòng!", {
        action: {
          label: "OK",
          onClick: () => router.push("/chat"),
        },
        duration: 5000,
      });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat ${
          theme === "dark" ? styles["chat-bg-dark"] : styles["chat-bg-light"]
        }`}
        aria-hidden="true"
      />

      {/* Nội dung có thể scroll */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header cố định */}
        <div className="sticky top-0 z-20">
          <ChatHeader room={room} />
        </div>

        {/* Chat content scrollable */}

        <ScrollArea className="flex-1 min-h-0 space-y-1">
          <ChatMessages roomId={roomId} messagesEndRef={messagesEndRef} />
        </ScrollArea>

          {isBlocked ? (
          <div className="flex flex-col items-center justify-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23232b]">
            <button
              onClick={handleUnblockUser}
              className="text-blue-600 font-medium hover:underline"
            >
              Unblock
            </button>
          </div>
        ) : (
          <ChatComposer roomId={roomId} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
