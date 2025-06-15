"use client";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const Page = () => {
  const { theme } = useTheme();
  const param = useParams();
  const roomId = param.id?.slice(0, 19) + ":matrix.org";

  const client = useMatrixClient();
  const [room, setRoom] = useState<sdk.Room | null>();
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!client) return;

    const foundRoom = client.getRoom(roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, client]);

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
      alert("Không thể tham gia phòng!");
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
      alert("Không thể từ chối lời mời!");
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
      {/* Background cố định */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={
          theme === "dark"
            ? {
                backgroundImage:
                  "url('https://i.pinimg.com/736x/7d/87/0e/7d870e07f3d5e3c4172c40e6f15e1498.jpg')",
              }
            : {
                backgroundImage:
                  "url('https://i.pinimg.com/736x/3d/8c/2f/3d8c2f2c82c1c9ef1e27be645cd1aa17.jpg')",
              }
        }
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
          <ChatMessages roomId={roomId} />
        </ScrollArea>
        <ChatComposer roomId={roomId} />
      </div>
    </div>
  );
};

export default Page;
