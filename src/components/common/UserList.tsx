import { RoomUser } from "@/hooks/useAllRoomUsers";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { useAddMembersStore } from "@/stores/useAddMembersStore";
import { Check } from "lucide-react";
import { useUserPresence } from "@/hooks/useUserPrecense";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

// Component to handle online indicator
const OnlineIndicator = ({ userId }: { userId: string }) => {
  const client = useMatrixClient();
  const { lastSeen } = useUserPresence(client!, userId);
  const isOnline =
    client && lastSeen !== null && Date.now() - lastSeen.getTime() < 30 * 1000;

  if (!isOnline) return null;

  return (
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border border-white bg-green-500 rounded-full"></div>
  );
};

export default function UserList({ users }: { users: RoomUser[] }) {
  const { selectedUsers, toggleUser } = useAddMembersStore();
  const userIdChatBot =
    process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev";
  const filteredUsers = users.filter((user) => user.userId !== userIdChatBot);

  return (
    <>
      {/* Original commented code */}
      {/* <div>
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
      </div> */}

      {/* New UI based on the image */}
      <div className="rounded-xl backdrop-blur-sm overflow-hidden pb-20">
        {filteredUsers
          .slice()
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map((user, index, array) => {
            const isChecked = selectedUsers.some(
              (u) => u.userId === user.userId
            );

            return (
              <div key={user.userId}>
                <div
                  className="flex items-center py-3 cursor-pointer"
                  onClick={() => toggleUser(user)}
                >
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? "bg-blue-600 border-blue-600 shadow-sm"
                        : "border-black/30  bg-transparent"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <div className="relative ml-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatarUrl || ""}
                        alt={user.avatarUrl ? "avatar" : "Unknown Avatar"}
                        className="rounded-full"
                      />
                      {!user.avatarUrl && (
                        <AvatarFallback className="bg-purple-400 text-white text-xl font-bold rounded-full border-2 border-white dark:border-gray-700">
                          {user.displayName.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <OnlineIndicator userId={user.userId} />
                  </div>

                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.displayName}
                    </p>
                  </div>
                </div>
                {index < array.length - 1 && (
                  <div className="border-b border-gray-200/50 dark:border-gray-700/50 mx-4"></div>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
