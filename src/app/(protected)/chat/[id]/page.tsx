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
import clsx from "clsx";

const ChatPage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  // Block user
  const [isBlocked, setIsBlocked] = useState(false);
  const ignoredUsers = useIgnoreStore((state) => state.ignoredUsers);

  // Prevent scroll on iOS when keyboard is open
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Fix viewport height for iOS Safari
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);

    const preventScroll = (e: TouchEvent) => {
      const target = e.target as Element;

      // Allow scrolling inside ScrollArea components
      const scrollableArea =
        target.closest("[data-radix-scroll-area-content]") ||
        target.closest("[data-radix-scroll-area-viewport]") ||
        target.closest("[data-slot='scroll-area']") ||
        target.closest("[data-slot='scroll-area-viewport']");

      // Prevent body scroll but allow scrollable areas
      if (!scrollableArea && e.touches.length === 1) {
        e.preventDefault();
      }
    };

    // Prevent document body from scrolling
    const originalBodyStyle = {
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);

      // Reset body styles
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;
      document.body.style.overflow = originalBodyStyle.overflow;
    };
  }, []);

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
    if (isInvite) {
      joinRoom();
    }
    // Lấy event cuối cùng trong room (nếu có)
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = [...events]
      .reverse()
      .find((ev) => ev.getType() === "m.room.message" && ev.getId());
    if (lastEvent) {
      sendReadReceipt(client, lastEvent);
    }
  }, [room, client]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
    <div className={clsx("bg-chat", styles.chatContainer)}>
      {/* Header */}
      <div className={clsx("shrink-0 z-10", styles.chatHeader)}>
        <ChatHeader room={room} />
      </div>

      {/* Chat content scrollable */}
      <div className={clsx("flex-1 min-h-0 relative", styles.chatContent)}>
        <div className={styles.chatMessages}>
          <ScrollArea className="h-full w-full">
            <ChatMessages roomId={roomId} messagesEndRef={messagesEndRef} />
          </ScrollArea>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      {isBlocked ? (
        <div
          className={clsx(
            "shrink-0 z-10 flex flex-col items-center justify-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23232b]",
            styles.chatFooter
          )}
        >
          <button
            onClick={handleUnblockUser}
            className="text-blue-600 font-medium hover:underline"
          >
            Unblock
          </button>
        </div>
      ) : (
        <div className={clsx("shrink-0 z-10", styles.chatFooter)}>
          <ChatComposer roomId={roomId} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
