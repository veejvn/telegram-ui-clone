"use client";
import { useState, useRef } from "react";
import { useMatrixClient } from "@/app/(protected)/layout";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatList } from "@/components/chat/ChatList";

export default function ChatPage() {
  const client = useMatrixClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    if (client) {
      searchMatrixUsers(client, value)
        .then((users) => setSearchResults(users))
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky bg-white dark:bg-black top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-blue-500">Edit</span>
          <h1 className="text-md font-semibold">Chats</h1>
          <div className="flex gap-3">
            <div className="text-blue-500">+</div>
            <div className="text-blue-500">✏️</div>
          </div>
        </div>
        <SearchBar
          ref={searchInputRef}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <ScrollArea tabIndex={-1}>
        <div className="flex flex-col w-full pb-[64px]">
          <ChatList
            searchTerm={searchTerm}
            searchResults={searchResults}
            loading={loading}
            searchInputRef={searchInputRef}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
