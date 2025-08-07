"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserRooms } from "@/services/chatService";
import { Room } from "matrix-js-sdk";
import { motion, AnimatePresence } from "framer-motion";
import { useForwardStore } from "@/stores/useForwardStore";

interface ForwardContactsListProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ForwardContactsList({
  isVisible,
  onClose,
}: ForwardContactsListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const client = useMatrixClient();

  useEffect(() => {
    if (!client || !isVisible) return;

    getUserRooms(client)
      .then((res) => {
        if (res.success && res.rooms) {
          setRooms(res.rooms);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch rooms:", error);
      });
  }, [client, isVisible]);

  useEffect(() => {
    if (!isVisible) {
      // Reset state when component closes
      setSelectedRooms([]);
    }
  }, [isVisible]);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map((room) => room.roomId));
    }
  };

  // Expose selected rooms to parent component
  useEffect(() => {
    // Store selected rooms in ForwardStore or pass up to parent
    const { clearRooms, addRoom } = useForwardStore.getState();
    clearRooms();
    selectedRooms.forEach((roomId) => addRoom(roomId));
  }, [selectedRooms]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#FFFFFF4D] shadow-[0_12px_48px_0_#0000001F] backdrop-blur-[48px] dark:bg-[#FFFFFF4D] border-t border-gray-200 dark:border-gray-700 overflow-hidden rounded-t-[36px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
          <div className="bg-[#FFFFFF4D] border rounded-full px-3 py-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-blue-600 text-sm hover:opacity-75"
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRooms.length === rooms.length
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selectedRooms.length === rooms.length && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {selectedRooms.length === rooms.length
                ? "Deselect all"
                : "Select all"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Contacts List */}
        <div className="max-h-60 overflow-y-auto">
          {rooms.map((room) => {
            const isSelected = selectedRooms.includes(room.roomId);

            return (
              <div
                key={room.roomId}
                onClick={() => handleRoomToggle(room.roomId)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Avatar */}
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
                      <AvatarFallback className="bg-purple-400 text-white text-sm font-semibold h-10 w-10 flex items-center justify-center">
                        {room.name.slice(0, 1)}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {room.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
