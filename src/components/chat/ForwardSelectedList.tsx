"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { useForwardStore } from "@/stores/useForwardStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { X } from "lucide-react";
import { getUserRooms } from "@/services/chatService";

export default function ForwardSelectedList() {
  const { roomIds, removeRoom, clearRooms } = useForwardStore();
  const client = useMatrixClient();

  const handleSelectAll = async () => {
    if (!client) return;

    try {
      const res = await getUserRooms(client);
      if (res.success && res.rooms) {
        // Clear current selection and add all rooms
        clearRooms();
        res.rooms.forEach((room) => {
          useForwardStore.getState().addRoom(room.roomId);
        });
      }
    } catch (error) {
      console.error("Failed to select all rooms:", error);
    }
  };

  if (roomIds.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleSelectAll}
          className="text-blue-600 text-sm hover:opacity-75"
        >
          Select all
        </button>
        <span className="text-gray-500 text-sm">•</span>
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {roomIds.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {roomIds.map((roomId) => {
          const room = client?.getRoom(roomId);
          if (!room) return null;

          return (
            <div key={roomId} className="relative group">
              <Avatar className="h-12 w-12">
                {room.getAvatarUrl(
                  process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
                  48,
                  48,
                  "crop",
                  false
                ) ? (
                  <AvatarImage
                    src={
                      room.getAvatarUrl(
                        process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
                        48,
                        48,
                        "crop",
                        false
                      ) || ""
                    }
                    alt="avatar"
                    className="h-12 w-12 object-cover"
                  />
                ) : (
                  <>
                    <AvatarImage
                      src=""
                      alt="Unknown Avatar"
                      className="h-12 w-12"
                    />
                    <AvatarFallback className="bg-purple-400 text-white text-sm font-semibold h-12 w-12 flex items-center justify-center">
                      {room.name.slice(0, 1)}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              {/* Remove button */}
              <button
                onClick={() => removeRoom(roomId)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from selection"
                aria-label="Remove from selection"
              >
                <X size={12} />
              </button>

              {/* Name */}
              <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400 truncate max-w-[48px]">
                {room.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
