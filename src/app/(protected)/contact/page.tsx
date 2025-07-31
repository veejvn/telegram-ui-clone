"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Filter } from "lucide-react";
import SearchBar from "@/components/layouts/SearchBar";
import NewContactModal from "@/components/contact/NewContactModal";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getLS } from "@/tools/localStorage.tool";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Interface cho thành viên
interface Member {
  userId: string;
  name?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

// Hàm nhóm theo chữ cái đầu
function groupContacts(
  contacts: any[],
  client: any,
  botId: string
): Record<string, { room: any; other: Member }[]> {
  const map: Record<string, { room: any; other: Member }[]> = {};
  contacts.forEach((room) => {
    const other: Member | undefined = client
      ? room.getJoinedMembers().find((m: Member) => m.userId !== client.getUserId())
      : undefined;
    if (!other || other.userId === botId) return;
    const firstLetter = (other.name?.[0] || other.userId?.[1] || "?").toUpperCase();
    if (!map[firstLetter]) map[firstLetter] = [];
    map[firstLetter].push({ room, other });
  });
  return map;
}

const ContactPage = () => {
  const [sortBy, setSortBy] = useState<"lastSeen" | "name">("name");
  const [contacts, setContacts] = useState<any[]>([]);
  const client = useMatrixClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNewContact, setShowNewContact] = useState(false);
  const userIdChatBot =
    process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev";

  useEffect(() => {
    if (!client) return;
    const loadContacts = async () => {
      setLoading(true);
      const rooms = await (
        await import("@/services/contactService")
      ).default.getDirectMessageRooms(client);
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

  // === SORT CONTACTS THEO sortBy ===
  const sortedContacts = [...contacts].sort((a, b) => {
    const otherA: Member | undefined = client
      ? a.getJoinedMembers().find((m: Member) => m.userId !== client.getUserId())
      : undefined;
    const otherB: Member | undefined = client
      ? b.getJoinedMembers().find((m: Member) => m.userId !== client.getUserId())
      : undefined;

    // Nếu sort by Name
    if (sortBy === "name") {
      const nameA = (otherA?.name || otherA?.userId || "").toLowerCase();
      const nameB = (otherB?.name || otherB?.userId || "").toLowerCase();
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    }

    // Nếu sort by Last Seen
    if (sortBy === "lastSeen") {
      if (otherA?.isOnline && !otherB?.isOnline) return -1;
      if (!otherA?.isOnline && otherB?.isOnline) return 1;
      const nameA = (otherA?.name || otherA?.userId || "").toLowerCase();
      const nameB = (otherB?.name || otherB?.userId || "").toLowerCase();
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    }

    return 0;
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(180deg, #D8EBFF 0%, #FDE2CF 100%)",
      }}
    >
      {/* STATUS BAR */}
      <div
        style={{
          height: "env(safe-area-inset-top, 32px)",
          minHeight: "100px",
          background: "transparent",
        }}
      />
      {/* HEADER */}
      <div className="pt-2 pb-2 px-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          My Contacts
        </h1>
        <div className="flex gap-3">
          <button
            className="rounded-full bg-[#D8EBFF]/70 hover:bg-[#D8EBFF] shadow-none p-2 flex items-center justify-center border border-[#e0e0e0]"
            onClick={() => setShowNewContact(true)}
            aria-label="Add"
          >
            <Plus size={20} className="text-black" />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="rounded-full bg-[#D8EBFF]/70 hover:bg-[#D8EBFF] shadow-none p-2 flex items-center justify-center border border-[#e0e0e0]"
                aria-label="Filter"
                type="button"
              >
                <Filter size={20} className="text-black" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="p-0 w-44 rounded-2xl border-0 shadow-lg bg-white"
              style={{
                boxShadow: "0 4px 32px 0 rgba(80,120,180,0.10)",
              }}
            >
              <div className="flex flex-col divide-y divide-gray-100">
                <button
                  className="flex items-center justify-between w-full text-left px-4 py-3 text-[16px] rounded-t-2xl focus:bg-gray-50"
                  onClick={() => setSortBy("name")}
                >
                  <span>by Name</span>
                  {sortBy === "name" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500">
                      <span className="w-2 h-2 bg-white rounded-full block" />
                    </span>
                  )}
                </button>
                <button
                  className="flex items-center justify-between w-full text-left px-4 py-3 text-[16px] rounded-b-2xl focus:bg-gray-50"
                  onClick={() => setSortBy("lastSeen")}
                >
                  <span>by Last Active</span>
                  {sortBy === "lastSeen" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500">
                      <span className="w-2 h-2 bg-white rounded-full block" />
                    </span>
                  )}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* SEARCHBAR */}
      <div className="px-5 pt-2 pb-1">
        {!options.includes("search") && <SearchBar />}
      </div>
      {/* CONTACTS */}
      <div className="px-2 pb-10 pt-1 w-full max-w-lg mx-auto">
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
          Object.entries(
            groupContacts(sortedContacts, client, userIdChatBot)
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, items]) => (
              <div key={letter}>
                {/* Group label với màu nền riêng, kéo dài full width */}
                <div
                  className="w-full px-5 py-2"
                  style={{
                    background: "rgba(220, 235, 252, 0.92)", // Xanh nhạt kéo dài đúng ý bạn
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: 2,
                    color: "#222f3e",
                  }}
                >
                  {letter}
                </div>
                {items.map(({ room, other }) => (
                  <div
                    key={room.roomId}
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/50 transition-all select-none"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {other.avatarUrl ? (
                        <Image
                          src={other.avatarUrl}
                          alt="avatar"
                          width={44}
                          height={44}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="rounded-full w-11 h-11 bg-[#f5f5f5] flex items-center justify-center text-xl font-bold text-[#888]">
                          {other?.name?.[0]?.toUpperCase() ||
                            other?.userId?.[1]?.toUpperCase() ||
                            "?"}
                        </div>
                      )}
                      {/* Online indicator */}
                      {other.isOnline ? (
                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white bg-[#47C269]" />
                      ) : null}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base text-[#1A1A1A] truncate">
                        {other?.name || other?.userId}
                      </div>
                      <div className="text-xs mt-0.5">
                        {other.isOnline ? (
                          <span className="text-[#47C269] font-medium">
                            Online
                          </span>
                        ) : (
                          <span className="text-[#A0A0A0]">
                            Online 2 hours ago
                          </span>
                        )}
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
    </div>
  );
};

export default ContactPage;
