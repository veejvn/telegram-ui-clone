import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { Room } from "matrix-js-sdk";

export default function ForwardListItem({ room }: { room: Room }) {
  return (
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
            <AvatarImage src="" alt="Unknown Avatar" className="h-10 w-10" />
            <AvatarFallback className="bg-purple-400 text-white text-lg font-semibold h-10 w-10 flex items-center justify-center">
              {room.name.slice(0, 1)}
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <p>{room.name}</p>
    </div>
  );
}
