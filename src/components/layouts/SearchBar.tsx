"use client";
import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SearchContent from "@/components/layouts/SearchContent";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import { useMatrixClient } from "@/app/(protected)/layout"; // Import hook lấy client

const SearchBar = forwardRef<HTMLInputElement, {}>(function SearchBar(_, ref) {
  const client = useMatrixClient(); // Lấy client từ context
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.length > 1 && client) {
      setLoading(true);
      searchMatrixUsers(client, searchTerm)
        .then((res) => {
          console.log("Kết quả search:", res);
          setSearchResults(res);
        })
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [searchTerm, client]);

  return (
    <div className="relative">
      <div className="px-4 py-2">
        <div className="relative border rounded-xl bg-white dark:bg-neutral-900">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <Input
            ref={ref}
            type="text"
            placeholder="Search user..."
            className="pl-10 border rounded-xl bg-white text-black placeholder:text-gray-400 dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {searchTerm.length > 1 && (
        <div className="absolute left-0 right-0 z-20">
          <SearchContent loading={loading} searchResults={searchResults} />
        </div>
      )}
    </div>
  );
});

export default SearchBar;
