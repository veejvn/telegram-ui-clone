"use client";
import { Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import SearchContent from "@/components/layouts/SearchContent";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import * as sdk from "matrix-js-sdk";

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
    <div className="relative">
      <div className="px-4 py-2">
        <div className="relative border rounded-xl bg-white dark:bg-neutral-900">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            placeholder="Search user..."
            className="pl-10 pr-10 border rounded-xl bg-white text-black placeholder:text-gray-400 dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="search"
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
