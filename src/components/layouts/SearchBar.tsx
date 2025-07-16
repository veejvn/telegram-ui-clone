"use client";
import { Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import SearchContent from "@/components/layouts/SearchContent";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import * as sdk from "@/lib/matrix-sdk";
import { cn } from "@/lib/utils";

const SearchBar = () => {
  const client = useMatrixClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messageResults, setMessageResults] = useState<any[]>([]);

  const normalizeUserIdInput = (raw: string, client: sdk.MatrixClient) => {
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

  useEffect(() => {
    const removeVietnameseTones = (str: string) =>
      str
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();

    if (searchTerm.length > 0 && client) {
      setLoading(true);
      const noToneTerm = removeVietnameseTones(searchTerm);
      const normalized = normalizeUserIdInput(searchTerm, client);

      searchMatrixUsers(client, normalized).then((res) => {
        setSearchResults(res);
      });

      client
        .searchMessageText({ query: searchTerm })
        .then((res) => {
          const rawResults = res?.search_categories?.room_events?.results || [];
          const filteredMessages = rawResults.filter((msg: any) => {
            const content = msg?.result?.content?.body || "";
            return (
              content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              removeVietnameseTones(content).includes(noToneTerm)
            );
          });
          setMessageResults(filteredMessages);
        })
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
      setMessageResults([]);
      setLoading(false);
    }
  }, [searchTerm, client]);

  return (
    <div className="relative py-3">
      <div className="relative px-4">
        <div className="relative h-10 w-full bg-[#e5e5ea] dark:bg-[#080808] rounded-[10px] transition-all duration-200">
          {/* Input */}
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder=""
            className="peer w-full h-full rounded-[10px] bg-transparent pl-10 pr-10 text-[17px] text-black dark:text-white border-none focus:outline-none focus:ring-0"
          />

          {/* Icon + chữ Search */}
          <div
            className={cn(
              "absolute inset-0 flex items-center transition-all duration-200 pointer-events-none",
              searchTerm
                ? "justify-start pl-3"
                : "peer-focus:justify-start peer-focus:pl-3 justify-center"
            )}
          >
            <Search className="h-5 w-5 text-gray-500 mr-2" />
            <span
              className={cn(
                "text-[17px] text-gray-500 transition-opacity duration-150",
                searchTerm ? "opacity-0" : "opacity-100",
                "peer-focus:opacity-100"
              )}
            >
              Search
            </span>
          </div>

          {/* Nút xoá */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {searchTerm.length > 0 && (
        <div className="absolute left-0 right-0 z-20">
          <SearchContent
            loading={loading}
            searchResults={searchResults}
            messageResults={messageResults}
            searchTerm={searchTerm}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
