"use client";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserRooms } from "@/services/chatService";
import { Room } from "matrix-js-sdk";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { Separator } from "../ui/ChatSeparator";

export default function ForwardList({ isSelected }: { isSelected: boolean }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const client = useMatrixClient();
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

  const handleSelectRooms = () => {};
  if (isSelected) {
    console.log("ok");
  }
  if (!rooms || rooms.length < 1) return null;

  return (
    <>
      {rooms.map((room, index) => (
        <div className=" hover:bg-gray-200 cursor-pointer" key={room.roomId}>
          <div className="flex items-center justify-between">
            <div className="flex items-center py-2 gap-2 pb-1 px-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                {room.getAvatarUrl(
                  process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
                  40,
                  40,
                  "crop",
                  false
                ) ? (
                  <AvatarImage
                    src={
                      room.getAvatarUrl(
                        process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
                        40,
                        40,
                        "crop",
                        false
                      ) || ""
                    }
                    alt="avatar"
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <>
                    <AvatarImage
                      src=""
                      alt="Unknown Avatar"
                      className="h-10 w-10"
                    />
                    <AvatarFallback className="bg-purple-400 text-white text-lg font-semibold h-10 w-10 flex items-center justify-center">
                      {room.name.slice(0, 1)}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <p>{room.name}</p>
            </div>
            {isSelected && (
              <div className="px-4">
                {/* checked */}
                {/* <span className="flex items-center justify-center w-6 h-6">
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
              </span> */}
                {/* unchecked */}
                <span className="flex items-center justify-center w-6 h-6">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-500 bg-transparent"></span>
                </span>
              </div>
            )}
          </div>
          {rooms.length - 1 !== index && (
            <div className="ml-[65px]">
              <Separator />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
