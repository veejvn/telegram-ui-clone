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
        const isChecked = roomIds.includes(room.roomId);

        return (
          <div
            className=" hover:bg-gray-200 cursor-pointer"
            key={room.roomId}
            onClick={() => handleClick(room.roomId)}
          >
            <div className="flex items-center justify-between">
              <ForwardListItem room={room} />

              {isSelected && (
                <div className="px-4">
                  {/* checked */}
                  {isChecked ? (
                    <span className="flex items-center justify-center w-6 h-6">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-6 h-6">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-500 bg-transparent"></span>
                    </span>
                  )}
                </div>
              )}
            </div>

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
