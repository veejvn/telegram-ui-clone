"use client";

import * as sdk from "matrix-js-sdk";
import { UserCheck } from "lucide-react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import ContactService from "@/services/contactService";
import { useToast } from "@/contexts/ToastProvider";
import { useRouter } from "next/navigation";
import { useRef } from "react";

type SearchContentProps = {
  loading: boolean;
  searchResults: any[];
  messageResults?: any[];
  searchTerm: string;
};

const SearchContent = ({
  loading,
  searchResults,
  messageResults = [],
}: SearchContentProps) => {
  const client = useMatrixClient();
  const { showToast } = useToast();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizeUserIdInput = (
    raw: string,
    client: sdk.MatrixClient
  ): string => {
    if (!raw) return raw;
    let id = raw.trim();
    if (!id.startsWith("@")) id = "@" + id;
    if (!id.includes(":")) {
      const domain = client
        .getHomeserverUrl()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      id += `:${domain}`;
    }
    return id;
  };

  const handleAddContact = async (client: sdk.MatrixClient, rawId: string) => {
    const userId = normalizeUserIdInput(rawId, client);
    try {
      const room = await ContactService.addContact(client, userId);
      if (room) {
        router.push(`/chat/${room.roomId}`);
      }
    } catch (error: any) {
      showToast("Lỗi khi tạo phòng: " + error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-neutral-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 text-center">
        Đang tìm kiếm...
      </div>
    );
  }

  if (!loading && searchResults.length === 0 && messageResults.length === 0) {
    return (
      <div className="p-4 bg-neutral-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 text-center">
        Không tìm thấy kết quả nào.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[70vh] md:max-h-[500px] overflow-y-auto bg-white dark:bg-[#181818] rounded-xl shadow-lg border border-gray-200 dark:border-[#232323] max-w-[1300px] mx-auto flex flex-col gap-2 w-full"
    >
      {/* USERS */}
      <div>
        <div className="font-semibold px-4 py-2 text-gray-500">Người dùng</div>
        {searchResults.length === 0 ? (
          <div className="px-4 py-2 text-gray-400 italic">
            Không tìm thấy người dùng nào.
          </div>
        ) : (
          searchResults.map((user, idx) => {
            const avatarUrl =
              client && user.avatar_url
                ? client.mxcUrlToHttp(user.avatar_url, 60, 60, "crop")
                : undefined;

            const isFriend = client
              ?.getRooms()
              .some((room) =>
                room
                  .getJoinedMembers()
                  .some((member) => member.userId === user.user_id)
              );

            const handleUserClick = async () => {
              if (!client) return;
              if (isFriend) {
                const room = client
                  .getRooms()
                  .find((r) =>
                    r.getJoinedMembers().some((m) => m.userId === user.user_id)
                  );
                if (room) {
                  router.push(`/chat/${room.roomId}`);
                }
              } else {
                await handleAddContact(client, user.user_id);
              }
            };

            return (
              <div
                key={user.user_id || idx}
                onClick={handleUserClick}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232323] transition"
              >
                {/* Avatar + friend icon */}
                <div className="relative w-10 h-10">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white text-lg">
                      {(user.display_name &&
                        user.display_name.charAt(0).toUpperCase()) ||
                        (user.user_id &&
                          user.user_id.charAt(1).toUpperCase()) ||
                        "?"}
                    </div>
                  )}
                  {isFriend && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-[2px] border">
                      <UserCheck className="w-3 h-3 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                    {user.display_name || user.user_id}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {user.user_id}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MESSAGES */}
      <div>
        <div className="font-semibold px-4 py-2 text-gray-500">Tin nhắn</div>
        {messageResults.length === 0 ? (
          <div className="px-4 py-2 text-gray-400 italic">
            Không tìm thấy tin nhắn nào.
          </div>
        ) : (
          messageResults.map((msg, idx) => (
            <div
              key={msg.result?.event_id || idx}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#232323] cursor-pointer"
              onClick={() => {
                const roomId = msg.result?.room_id;
                const eventId = msg.result?.event_id;
                if (roomId && eventId) {
                  router.push(`/chat/${roomId}?highlight=${eventId}`);
                }
              }}
            >
              <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                {msg.result?.content?.body}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {msg.result?.sender}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchContent;
