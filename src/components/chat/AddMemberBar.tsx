import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { useAddMembersStore } from "@/stores/useAddMembersStore";

export default function AddMemberBar() {
  const selectedUsers = useAddMembersStore((state) => state.selectedUsers);

  return (
    <div className="flex flex-wrap items-center px-3 py-2 gap-x-2 gap-y-2 border-gray-800 dark:bg-[#1a1a1a]">
      {selectedUsers.map((user) => (
        <div
          key={user.userId}
          className="flex items-center bg-gray-300 dark:bg-gray-600 rounded-full pe-2 py-0.5 gap-1 max-w-full"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={user.avatarUrl || ""}
              alt={user.avatarUrl ? "avatar" : "Unknown Avatar"}
            />
            {!user.avatarUrl && (
              <AvatarFallback className="bg-purple-400 text-white text-xs font-bold">
                {user.displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <p className="text-sm whitespace-nowrap">{user.displayName}</p>
        </div>
      ))}

      <input
        type="text"
        placeholder="Who would you like to add?"
        className="flex-1 min-w-[150px] bg-transparent outline-none dark:text-white text-sm ps-2"
      />
    </div>
  );
}
