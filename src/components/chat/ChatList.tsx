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
}: {
  searchTerm?: string;
  searchResults?: any[];
  loading?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <div className="relative">
      {searchTerm.length < 2 && (
        <>
          <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
          <Link href={`/chat/1`}>
            <ChatListItem />
          </Link>
          <Link href={`/chat/2`}>
            <ChatListItem />
          </Link>
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
