import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { Room } from "matrix-js-sdk";
import { useForwardStore } from "@/stores/useForwardStore";

interface ForwardListItemProps {
  room: Room;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ForwardListItem({
  room,
  isSelected = false,
  onClick,
}: ForwardListItemProps) {
  const { roomIds } = useForwardStore();
  const isChecked = roomIds.includes(room.roomId);

  return (
    <div
      className="flex items-center py-3 gap-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Checkbox */}
      {isSelected && (
        <div className="flex-shrink-0">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isChecked
                ? "bg-blue-500 border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {isChecked && (
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
        </div>
      )}

      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
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
            <AvatarImage src="" alt="Unknown Avatar" className="h-12 w-12" />
            <AvatarFallback className="bg-purple-400 text-white text-lg font-semibold h-12 w-12 flex items-center justify-center">
              {room.name.slice(0, 1)}
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-gray-900 dark:text-white truncate">
          {room.name}
        </p>
      </div>
    </div>
  );
}
