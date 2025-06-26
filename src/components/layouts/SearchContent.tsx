"use client";

import * as sdk from "matrix-js-sdk";
import { UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  searchTerm,
}: SearchContentProps) => {
  const client = useMatrixClient();
  const { showToast } = useToast();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const normalizedSearch = normalize(searchTerm);

  const filteredUsers = searchResults.filter((user) => {
    const displayName = normalize(user.display_name || "");
    const userId = normalize(user.user_id || "");
    return (
      displayName.includes(normalizedSearch) ||
      userId.includes(normalizedSearch)
    );
  });

  const handleAddContact = async (
    client: sdk.MatrixClient,
    user_id: string
  ) => {
    try {
      const room = await ContactService.addContact(client, user_id);
      if (room) router.push(`/chat/${room.roomId}`);
    } catch (error: any) {
      showToast(`${error}`, "error");
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white text-gray-400 dark:text-gray-500 text-center">
        Đang tìm kiếm...
      </div>
    );
  }

  if (!loading && filteredUsers.length === 0 && messageResults.length === 0) {
    return (
      <div className="p-4 bg-white text-gray-400 dark:text-gray-500 text-center">
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
        {filteredUsers.length === 0 ? (
          <div className="px-4 py-2 text-gray-400 italic">
            Không tìm thấy người dùng nào.
          </div>
        ) : (
          filteredUsers.map((user, idx) => {
            const hasCommonRoom = client
              ?.getRooms()
              .some((room) =>
                room
                  .getJoinedMembers()
                  .some((member) => member.userId === user.user_id)
              );

            const handleUserClick = () => {
              if (hasCommonRoom) {
                const room = client
                  ?.getRooms()
                  .find((r) =>
                    r.getJoinedMembers().some((m) => m.userId === user.user_id)
                  );
                if (room) {
                  router.push(`/chat/${room.roomId}`);
                }
              }
            };

            return (
              <div
                key={user.user_id || idx}
                onClick={handleUserClick}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232323] transition"
              >
                <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white text-lg">
                  {(user.display_name &&
                    user.display_name.charAt(0).toUpperCase()) ||
                    (user.user_id && user.user_id.charAt(1).toUpperCase()) ||
                    "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                    {user.display_name || "Không có tên"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {user.user_id}
                  </div>
                </div>
                {!hasCommonRoom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Đừng để click thẻ chạy
                      client && handleAddContact(client, user.user_id);
                    }}
                    size="lg"
                    className="bg-white hover:bg-zinc-300 text-blue-500"
                    disabled={!client}
                  >
                    <UserRoundPlus />
                  </Button>
                )}
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
