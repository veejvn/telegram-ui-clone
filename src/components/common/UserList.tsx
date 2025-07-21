import { RoomUser } from "@/hooks/useAllRoomUsers";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { Separator } from "../ui/ChatSeparator";
import { useAddMembersStore } from "@/stores/useAddMembersStore";

export default function UserList({ users }: { users: RoomUser[] }) {
  const { selectedUsers, toggleUser } = useAddMembersStore();
  const userIdChatBot = process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev";
  const filteredUsers = users.filter(user => user.userId !== userIdChatBot);

  const groupedUsers = filteredUsers.reduce<Record<string, RoomUser[]>>((acc, user) => {
    const firstLetter = user.displayName.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(user);
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedUsers).sort();

  return (
    <div>
      {sortedGroupKeys.map((letter) => (
        <div key={letter}>
          <p className="bg-gray-200 dark:bg-[#1a1a1a] px-2 py-0.5">{letter}</p>
          {groupedUsers[letter]
            .slice()
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map((user) => {
              const isChecked = selectedUsers.some(
                (u) => u.userId === user.userId
              );

              return (
                <div
                  key={user.userId}
                  className="px-2 pt-2 cursor-pointer"
                  onClick={() => toggleUser(user)}
                >
                  <div className="flex items-center gap-2 pb-2">
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
                      <span className="w-6 h-6 rounded-full border-2 border-blue-500 bg-transparent"></span>
                    )}

                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatarUrl || ""}
                        alt={user.avatarUrl ? "avatar" : "Unknown Avatar"}
                      />
                      {!user.avatarUrl && (
                        <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
                          {user.displayName.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <span className="text-gray-400 text-sm">
                        last seen recently
                      </span>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
