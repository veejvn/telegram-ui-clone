import { useState } from "react";
import { Separator } from "@/components/ui/ChatSeparator";
import { ChatListItem } from "./ChatListItem";
import Link from "next/link";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import { useMatrixClient } from "@/app/(protected)/layout";
import SearchBar from "@/components/layouts/SearchBar";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
function SearchDropdownPortal({
  anchorRef,
  inputRef,
  children,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        (!inputRef?.current || !inputRef.current.contains(event.target as Node)) // kiểm tra inputRef
      ) {
        if (onClose) {
          onClose();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, inputRef]);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 4 + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        zIndex: 9999,
      });
    }
  }, [anchorRef.current]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="rounded-xl shadow-lg border border-gray-200 dark:border-[#232323] bg-white dark:bg-[#181818] overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
}

export const ChatList = ({
  searchTerm = "",
  searchResults = [],
  loading = false,
  searchInputRef,
}: {
  searchTerm?: string;
  searchResults?: any[];
  loading?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(true);

  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      setShowDropdown(true);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!searchInputRef?.current) return;
    const handleFocus = () => {
      if (searchTerm && searchTerm.length > 1) setShowDropdown(true);
    };
    const input = searchInputRef.current;
    input.addEventListener("focus", handleFocus);
    return () => input.removeEventListener("focus", handleFocus);
  }, [searchInputRef, searchTerm]);

  return (
    <div className="relative">
      <div ref={anchorRef}></div>
      {searchTerm && searchTerm.length > 1 && showDropdown && (
        <SearchDropdownPortal
          anchorRef={anchorRef}
          inputRef={searchInputRef}
          onClose={() => setShowDropdown(false)}
        >
          <div className="max-h-[600px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-gray-400 dark:text-gray-500 text-center">
                Đang tìm kiếm...
              </div>
            )}
            {!loading && searchResults.length === 0 && (
              <div className="p-4 text-gray-400 dark:text-gray-500 text-center">
                Không tìm thấy người dùng nào.
              </div>
            )}
            {searchResults.map((user, idx) => (
              <div
                key={user.user_id || idx}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232323] transition"
              >
                <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white text-lg">
                  {(user.display_name &&
                    user.display_name.charAt(0).toUpperCase()) ||
                    (user.user_id && user.user_id.charAt(1).toUpperCase()) ||
                    "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.display_name || "Không có tên"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.user_id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SearchDropdownPortal>
      )}
      {searchTerm.length < 2 && (
        <>
          <Link href={`/chat/1`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/2`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/3`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/4`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/5`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/6`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/7`}>
            <ChatListItem />
          </Link>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/8`}>
            <ChatListItem />
          </Link>

          <Separator className="opacity-30" />
        </>
      )}
    </div>
  );
};
