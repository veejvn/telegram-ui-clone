"use client";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserRooms } from "@/services/chatService";
import { Room } from "matrix-js-sdk";
import React, { useEffect, useState } from "react";
import { Separator } from "../ui/ChatSeparator";
import ForwardListItem from "./ForwardListItem";
import { useForwardStore } from "@/stores/useForwardStore";
import { useRouter } from "next/navigation";

export default function ForwardList({ isSelected }: { isSelected: boolean }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const client = useMatrixClient();
  const router = useRouter();

  const { roomIds, addRoom, removeRoom } = useForwardStore();

  useEffect(() => {
    if (!client) return;
    getUserRooms(client)
      .then((res) => {
        if (res.success && res.rooms) {
          setRooms(res.rooms);
        } else {
          console.error("Failed to fetch user rooms or rooms are undefined.");
        }
      })
      .catch((error) => {
        console.error("An error occurred while fetching user rooms:", error);
      });
  }, [client]);

  const handleClick = (roomId: string) => {
    if (isSelected) {
      // toggle
      if (roomIds.includes(roomId)) {
        removeRoom(roomId);
      } else {
        addRoom(roomId);
      }
    } else {
      router.push(`/chat/${roomId}`);
    }
  };

  if (!rooms || rooms.length < 1) return null;

  return (
    <>
      {rooms.map((room, index) => {
        return (
          <div key={room.roomId}>
            <ForwardListItem
              room={room}
              isSelected={isSelected}
              onClick={() => handleClick(room.roomId)}
            />

            {rooms.length - 1 !== index && (
              <div className="ml-[65px]">
                <Separator />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
