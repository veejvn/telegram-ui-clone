"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as sdk from "matrix-js-sdk";
import { Check, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NewContactModal from "@/components/contact/NewContactModal";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ContactService from "@/services/contactService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getLS } from "@/tools/localStorage.tool";
import { ROUTES } from "@/constants/routes";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

interface Contact {
  firstName: string;
  lastName: string;
  phones: string[];
}

const ContactPage = () => {
  const [sortBy, setSortBy] = useState<"lastSeen" | "name">("name");
  const [contacts, setContacts] = useState<sdk.Room[]>([]);
  const client = useMatrixClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNewContact, setShowNewContact] = useState(false);
  const [search, setSearch] = useState(""); // <--- NEW: state for search

  useEffect(() => {
    if (!client) return;
    const loadContacts = async () => {
      setLoading(true);
      const rooms = await ContactService.getDirectMessageRooms(client);
      setContacts(rooms);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    loadContacts();
  }, [client]);

  const handleAddContact = (contact: Contact) => { };

  const handleSettingClick = () => {
    router.push(ROUTES.SETTING);
  };

  const headerStyle = getHeaderStyleWithStatusBar();

  const hide = getLS("hide") || [];
  const options = Array.isArray(hide) ? hide : [];

  // ---- FILTERED CONTACTS BY SEARCH ----
  const filteredContacts = search
    ? contacts.filter((room) => {
      if (!client) return true;
      const other = room
        .getJoinedMembers()
        .find((m) => m.userId !== client.getUserId());
      const target =
        (other?.name || "") + " " + (other?.userId || "");
      return target.toLowerCase().includes(search.toLowerCase());
    })
    : contacts;

  // --- UI RENDER ---
  return (
    <>
      {/* HEADER */}
      <div style={headerStyle}>
        <div className="flex items-center justify-between px-4 py-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="text-blue-500 border-none bg-transparent hover:bg-zinc-200 font-semibold px-0">
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0 ml-3 rounded-2xl">
              <div className="flex flex-col">
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-white text-black hover:bg-zinc-200 text-left rounded-none rounded-t-2xl ${sortBy === "lastSeen" ? "font-bold" : ""}`}
                  onClick={() => setSortBy("lastSeen")}
                >
                  By Last Seen
                  {sortBy === "lastSeen" && <Check />}
                </Button>
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-white text-black hover:bg-zinc-200 text-left rounded-none rounded-b-2xl ${sortBy === "name" ? "font-bold" : ""}`}
                  onClick={() => setSortBy("name")}
                >
                  By Name
                  {sortBy === "name" && <Check />}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-blue-500 font-bold text-xl px-0"
              onClick={() => setShowNewContact(true)}
              aria-label="Add Contact"
            >
              +
            </Button>
          </div>
        </div>
        {/* --- SEARCH BAR, THÊM LOGIC --- */}
        {!options.includes("search") && (
          <div className="px-4 py-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 rounded-xl
                  bg-white dark:bg-zinc-900
                  text-black dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  border-none
                  focus:outline-none
                  transition-colors
                "
                placeholder="Search"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                {/* SVG kính lúp */}
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex flex-1 flex-col justify-center items-center px-6 text-center">
            <div className="size-30 mt-10 mb-8 animate-pulse bg-gray-200 rounded-full" />
            <h2 className="text-xl font-semibold my-4">Loading contacts...</h2>
          </div>
        ) : contacts.length === 0 ? (
          // --------- UI KHI KHÔNG CÓ LIÊN HỆ (NHƯ ẢNH ĐẦU) ---------
          <div className="flex flex-1 flex-col justify-center items-center px-6 text-center">
            <div className="size-30 mt-10 mb-8">
              <Image
                src="/chat/images/contact.png"
                alt="Contacts Icon"
                width={120}
                height={120}
                style={{ height: "120px", width: "auto" }}
                loading="eager"
                priority
              />
            </div>
            <h2 className="text-xl font-semibold my-4">Access to Contacts</h2>
            <p className="text-gray-400 mb-6">
              Please allow Telegram access to your phonebook to seamlessly find all your friends.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-64 py-4 text-lg bg-blue-500 text-white hover:bg-blue-600 rounded-xl mb-2">
                  Allow Access
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-80 h-40 border-0 p-0">
                <AlertDialogHeader className="pt-4">
                  <AlertDialogTitle className="text-base text-center">
                    Please Allow Access
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-center">
                    Telegram does not have access to your contacts
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 w-full border-t gap-0">
                  <AlertDialogCancel className="h-full text-blue-500 bg-white hover:bg-zinc-200 border-r rounded-none rounded-bl-lg">
                    Not Now
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSettingClick}
                    className="h-full text-blue-500 bg-white hover:bg-zinc-200 border-l rounded-none rounded-br-lg"
                  >
                    Setting
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="link" className="text-blue-500 mt-2">
              Privacy Policy
            </Button>
          </div>
        ) : (
          // --------- UI KHI ĐÃ CÓ LIÊN HỆ (NHƯ ẢNH SAU) ---------
          <div>
            {/* Alert: đồng bộ theme */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 mb-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-500">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <circle cx="12" cy="16" r="1" />
                  </svg>
                </span>
                <span className="font-bold text-base text-gray-900 dark:text-white">
                  Access to Contacts
                </span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Please allow Telegram access to your phonebook to seamlessly find all your friends.
              </div>
              <Button
                variant="link"
                className="text-blue-500 px-0 font-semibold text-base text-left w-fit"
                onClick={handleSettingClick}
              >
                Allow in Settings
              </Button>
            </div>
            {/* Invite friends */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-blue-500 font-semibold px-2 py-3 rounded-xl w-full justify-start mb-2"
              onClick={() => setShowNewContact(true)}
            >
              <UserPlus className="mr-2" size={20} />
              Invite Friends
            </Button>
            <NewContactModal
              open={showNewContact}
              onOpenChange={setShowNewContact}
              onAddContact={handleAddContact}
              onClose={() => setShowNewContact(false)}
            />
            {/* Danh sách liên hệ */}
            <div className="uppercase text-xs text-gray-400 font-semibold tracking-wider mb-2 px-1">
              Contacts
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
              {filteredContacts.length === 0 ? (
                <li className="py-6 text-center text-gray-400 dark:text-gray-500 select-none">
                  No contacts found.
                </li>
              ) : (
                filteredContacts.map((room) => {
                  const other = client
                    ? room.getJoinedMembers().find((m) => m.userId !== client.getUserId())
                    : undefined;
                  return (
                    <li
                      key={room.roomId}
                      className="flex items-center gap-3 py-3 px-2 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors rounded-lg cursor-pointer"
                    >
                      <Avatar className="flex items-center justify-center w-10 h-10 text-base bg-zinc-300 dark:bg-zinc-700">
                        {other?.name?.[0]?.toUpperCase() ||
                          other?.userId?.[1]?.toUpperCase() ||
                          "?"}
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate text-gray-900 dark:text-white">
                          {other?.name || other?.userId}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {other?.userId}
                        </span>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Luôn render modal ở cuối root để đảm bảo z-index */}
      <NewContactModal
        open={showNewContact}
        onOpenChange={setShowNewContact}
        onAddContact={handleAddContact}
        onClose={() => setShowNewContact(false)}
      />
    </>
  );
};

export default ContactPage;
