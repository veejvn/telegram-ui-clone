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
import { sendReadReceipt } from "@/utils/chat/sendReceipt";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./page.module.css";

const ChatPage = () => {
  const { theme } = useTheme();
  const [joining, setJoining] = useState(false);
  const [room, setRoom] = useState<sdk.Room | null>();
  const param = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const client = useMatrixClient();
  const roomId = param.id?.slice(0, 19) + ":matrix.org";
  const router = useRouter();

  useEffect(() => {
    if (!client) return;

    const foundRoom = client.getRoom(roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, client]);

  
  useEffect(() => {
    if (!client || !room) return;
    // Lấy event cuối cùng trong room (nếu có)
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;
    if (lastEvent) {
      sendReadReceipt(client, lastEvent);
    }
  }, [room, client]);
  
  if (!room) return null;
  // Kiểm tra trạng thái invite
  const isInvite = room?.getMyMembership() === "invite";

  const handleJoin = async () => {
    if (!client) return;
    setJoining(true);
    try {
      await client.joinRoom(roomId);
      // Sau khi join, reload lại room
      const joinedRoom = client.getRoom(roomId);
      setRoom(joinedRoom);
    } catch (e) {
      toast.error("Không thể tham gia phòng!", {
        action: {
          label: "OK",
          onClick: () => router.push("/chat"),
        },
        duration: 5000,
      });
    }
    setJoining(false);
  };

  const handleReject = async () => {
    if (!client) return;
    setJoining(true);
    try {
      await client.leave(roomId);
      setRoom(null);
    } catch (e) {
      toast.error("Không thể từ chối mời lời mời", {
        action: {
          label: "OK",
          onClick: () => router.push("/chat"),
        },
        duration: 5000,
      });
    }
    setJoining(false);
  };
  if (isInvite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4 text-lg font-semibold">
          Bạn được mời vào phòng: {room.name || roomId}
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleJoin}
            disabled={joining}
          >
            Chấp nhận
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded"
            onClick={handleReject}
            disabled={joining}
          >
            Từ chối
          </button>
        </div>
      </div>
    );
  }

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
        <ScrollArea className="flex-1 min-h-0 px-4 space-y-1">
          <ChatMessages roomId={roomId} messagesEndRef={messagesEndRef}/>
        </ScrollArea>
        <ChatComposer roomId={roomId} />
      </div>
    </div>
  );
};

export default ChatPage;
