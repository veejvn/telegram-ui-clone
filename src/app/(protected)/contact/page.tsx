"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import NewContactModal from "@/components/contact/NewContactModal";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getLS } from "@/tools/localStorage.tool";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MatrixClient, Room } from "matrix-js-sdk";

// Interface cho thành viên
interface Member {
  userId: string;
  name?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

// Hàm nhóm theo chữ cái đầu
function groupContacts(
  contacts: Room[],
  client: MatrixClient | null,
  botId: string
): Record<string, { room: any; other: Member; avatarUrl: string }[]> {
  if (!client) return {};
  const HOMESERVER_URL =
    process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.teknix.dev";
  const map: Record<
    string,
    { room: Room; other: Member; avatarUrl: string }[]
  > = {};
  contacts.forEach((room) => {
    const otherMember = client
      ? room.getJoinedMembers().find((m) => m.userId !== client.getUserId())
      : undefined;
    if (!otherMember || otherMember.userId === botId) return;

    // Convert member thành interface Member và lấy avatar đúng cách
    const other: Member = {
      userId: otherMember.userId,
      name: otherMember.name || otherMember.userId,
      isOnline: false, // Sẽ được cập nhật sau
      lastSeen: undefined,
    };

    // Lấy avatar URL từ RoomMember bằng phương thức getAvatarUrl
    const avatarUrl =
      otherMember.getAvatarUrl(
        HOMESERVER_URL,
        96,
        96,
        "crop",
        false,
        true,
        false
      ) || "";

    const firstLetter = (
      other.name?.[0] ||
      other.userId?.[1] ||
      "?"
    ).toUpperCase();
    if (!map[firstLetter]) map[firstLetter] = [];
    map[firstLetter].push({ room, other, avatarUrl });
  });
  return map;
}

// Hiển thị trạng thái online/offline
function formatLastSeen(isOnline?: boolean, lastSeen?: number) {
  if (isOnline)
    return <span className="text-[#47C269] font-medium">Online</span>;
  if (!lastSeen) return <span className="text-[#A0A0A0]">Offline</span>;

  const now = Date.now();
  const diffMs = now - lastSeen;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return <span className="text-[#A0A0A0]">Online only</span>;
  if (diffSec < 3600)
    return (
      <span className="text-[#A0A0A0]">
        Online {Math.floor(diffSec / 60)} minutes ago
      </span>
    );
  if (diffSec < 86400)
    return (
      <span className="text-[#A0A0A0]">
        Online {Math.floor(diffSec / 3600)} hours ago
      </span>
    );
  return (
    <span className="text-[#A0A0A0]">
      Online {Math.floor(diffSec / 86400)} days ago
    </span>
  );
}

const ContactPage = () => {
  const [sortBy, setSortBy] = useState<"lastSeen" | "name">("name");
  const [contacts, setContacts] = useState<Room[]>([]);
  const client = useMatrixClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showFilter, setShowFilter] = useState(false); // <--- NEW STATE!
  const userIdChatBot =
    process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev";

  useEffect(() => {
    if (!client) return;
    const loadContacts = async () => {
      setLoading(true);
      const rooms = await (
        await import("@/services/contactService")
      ).default.getDirectMessageRooms(client);

      // Thêm field lastSeen mock cho demo
      rooms.forEach((room: any) => {
        const other: Member | undefined = client
          ? room
              .getJoinedMembers()
              .find((m: Member) => m.userId !== client.getUserId())
          : undefined;
        if (other) {
          if (!other.isOnline) {
            other.lastSeen =
              Date.now() - Math.floor(Math.random() * 3 * 60 * 60 * 1000);
          } else {
            other.lastSeen = Date.now();
          }
        }
      });

      setContacts(rooms);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    loadContacts();
  }, [client]);

  interface Contact {
    firstName: string;
    lastName: string;
    phones: string[];
  }

  const handleAddContact = (contact: Contact) => {
    // Chưa implement
  };

  const hide = getLS("hide") || [];
  const options = Array.isArray(hide) ? hide : [];

  // SORT CONTACTS
  const sortedContacts = [...contacts].sort((a, b) => {
    const otherA: Member | undefined = client
      ? a
          .getJoinedMembers()
          .find((m: Member) => m.userId !== client.getUserId())
      : undefined;
    const otherB: Member | undefined = client
      ? b
          .getJoinedMembers()
          .find((m: Member) => m.userId !== client.getUserId())
      : undefined;

    if (sortBy === "name") {
      const nameA = (otherA?.name || otherA?.userId || "").toLowerCase();
      const nameB = (otherB?.name || otherB?.userId || "").toLowerCase();
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    }

    if (sortBy === "lastSeen") {
      if (otherA?.isOnline && !otherB?.isOnline) return -1;
      if (!otherA?.isOnline && otherB?.isOnline) return 1;
      const aSeen = otherA?.lastSeen ?? 0;
      const bSeen = otherB?.lastSeen ?? 0;
      return bSeen - aSeen;
    }

    return 0;
  });

  // Search Bar State/Logic (Floating Style)
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="min-h-screen w-full">
      {/* STATUS BAR */}
      <div
        className="min-h-[50px] bg-transparent"
        style={{
          height: "env(safe-area-inset-top, 32px)",
        }}
      />
      {/* HEADER */}
      <div className="pt-2 pb-2 px-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          My Contacts
        </h1>
        <div className="flex gap-3">
          {/* Nút + */}
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-[#D8EBFF] transition-all box-border"
            onClick={() => setShowNewContact(true)}
            aria-label="Add"
          >
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect x="17" y="8" width="1" height="20" rx="1" fill="#222" />
              <rect x="8" y="17" width="20" height="1" rx="1" fill="#222" />
            </svg>
          </button>

          {/* Filter */}
          <Popover open={showFilter} onOpenChange={setShowFilter}>
            <PopoverTrigger asChild>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[#e0e0e0] bg-[#D8EBFF] transition-all box-border"
                aria-label="Filter"
                type="button"
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  {/* Gạch trên cùng */}
                  <rect x="8" y="10" width="24" height="1" rx="1" fill="#222" />
                  {/* Gạch giữa */}
                  <rect
                    x="12"
                    y="17"
                    width="16"
                    height="1"
                    rx="1"
                    fill="#222"
                  />
                  {/* Gạch dưới cùng */}
                  <rect
                    x="15"
                    y="24"
                    width="10"
                    height="1"
                    rx="1"
                    fill="#222"
                  />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="p-0 w-48 min-h-[78px] rounded-[20px] bg-white border-none pt-3 pb-3 flex flex-col gap-2"
              style={{
                boxShadow: "0px 4px 24px 0px rgba(44, 68, 115, 0.10)",
              }}
            >
              <button
                className="flex items-center justify-between w-full text-left px-4 py-0 text-base font-normal bg-transparent outline-none focus:bg-gray-100 min-h-[27px] rounded-xl"
                onClick={() => {
                  setSortBy("name");
                  setShowFilter(false);
                }}
              >
                <span>by Name</span>
                {sortBy === "name" && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1976ed] ml-2.5">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#1976ed" />
                      <path
                        d="M6 10.5L9 13.5L14 7.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
              <button
                className="flex items-center justify-between w-full text-left px-4 py-0 text-base font-normal bg-transparent outline-none focus:bg-gray-100 min-h-[27px] rounded-xl"
                onClick={() => {
                  setSortBy("lastSeen");
                  setShowFilter(false);
                }}
              >
                <span>by Last Active</span>
                {sortBy === "lastSeen" && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1976ed] ml-2.5">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#1976ed" />
                      <path
                        d="M6 10.5L9 13.5L14 7.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* DANH SÁCH CONTACTS */}
      <div
        className={`px-2 pb-10 pt-1 w-full max-w-lg mx-auto transition-all duration-200 ${
          showFilter ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="rounded-full w-20 h-20 bg-gray-200 animate-pulse mb-6" />
            <h2 className="text-lg font-semibold text-gray-500">
              Loading contacts...
            </h2>
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28">
            <Image
              src="/chat/images/contact.png"
              alt="Contacts Icon"
              width={100}
              height={100}
              className="mb-6"
            />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No Contacts Yet
            </h2>
            <p className="text-gray-400 mb-3 text-sm max-w-[250px] text-center">
              Add your friends and start chatting. Click + to add new contact!
            </p>
            <button
              className="px-5 py-2 rounded-xl bg-[#1A73E8] text-white font-semibold text-base shadow-sm"
              onClick={() => setShowNewContact(true)}
            >
              Add Contact
            </button>
          </div>
        ) : (
          Object.entries(groupContacts(sortedContacts, client, userIdChatBot))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, items]) => (
              <div key={letter}>
                <div className="w-full px-5 py-2 bg-[#FFFFFF4D] font-semibold text-[15px] tracking-[2px] text-[#222f3e]">
                  {letter}
                </div>
                {items.map(({ room, other, avatarUrl }) => (
                  <div
                    key={room.roomId}
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/50 transition-all select-none"
                  >
                    {/* Avatar logic */}
                    <div className="relative">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="avatar"
                          width={44}
                          height={44}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="rounded-full w-11 h-11 bg-[#f5f5f5] flex items-center justify-center text-xl font-bold text-[#888]">
                          {other?.name?.[0]?.toUpperCase() ||
                            other?.userId?.[1]?.toUpperCase() ||
                            "?"}
                        </div>
                      )}
                      {/* Online indicator */}
                      {other.isOnline && (
                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white bg-[#47C269]" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base text-[#1A1A1A] truncate">
                        {other?.name || other?.userId}
                      </div>
                      <div className="text-xs mt-0.5">
                        {formatLastSeen(other.isOnline, other.lastSeen)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
        )}
      </div>

      {/* MODAL */}
      <NewContactModal
        open={showNewContact}
        onOpenChange={setShowNewContact}
        onAddContact={handleAddContact}
        onClose={() => setShowNewContact(false)}
      />

      {/* SEARCH BAR FLOATING */}
      {!options.includes("search") && (
        <div className="fixed bottom-10 left-0 w-full z-10 flex justify-center pointer-events-none">
          <label
            className={`
              group flex items-center rounded-full
              transition-all duration-300
              shadow-lg
              backdrop-blur-md
              pointer-events-auto
              ${
                isFocused || searchValue
                  ? "bg-white/50 px-5 py-2 w-[90vw] max-w-md"
                  : "bg-white px-3 py-1 w-30"
              }
            `}
            style={{ marginBottom: "env(safe-area-inset-bottom, 12px)" }}
          >
            <input
              type="text"
              className={`
                outline-none bg-transparent w-full
                transition-all duration-300
              `}
              placeholder={
                isFocused || searchValue
                  ? "Tìm kiếm mọi thứ bằng AI"
                  : "Tìm kiếm"
              }
              value={searchValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search size={20} className="text-zinc-700" />
          </label>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
