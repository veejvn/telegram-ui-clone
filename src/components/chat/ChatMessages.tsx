"use client";

import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { MessageStatus, useChatStore } from "@/stores/useChatStore";
import { getOlderMessages } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { convertEventsToMessages } from "@/utils/chat/convertEventsToMessages";
import { groupMessagesByDate } from "@/utils/chat/groupMessagesByDate";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessages = ({ roomId, messagesEndRef }: ChatMessagesProps) => {
  useTimeline(roomId);
  const client = useMatrixClient();
  const router = useRouter();

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const { prependMessages, setOldestEventId } = useChatStore();
  const messages = messagesByRoom[roomId] ?? [];
  const grouped = groupMessagesByDate(messages);

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight") ?? null;
  const searching = searchParams.get("searching") === "true";
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const firstHighlightedRef = useRef<HTMLDivElement | null>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreByRoom, setHasMoreByRoom] = useState<{
    [roomId: string]: boolean;
  }>({});

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    setHasMoreByRoom((prev) => ({
      ...prev,
      [roomId]: true,
    }));
  }, [roomId]);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (!isLoadingMore && messagesEndRef?.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [messages.length, isLoadingMore, messagesEndRef]);

  // Restore scroll position after loading old messages
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (isLoadingMore && prevScrollHeightRef.current !== null && container) {
      container.scrollTop +=
        container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
    }
  }, [messages.length, isLoadingMore]);

  // Tìm các eventId chứa searchText (bỏ qua forward)
  useEffect(() => {
    if (!searchText) {
      setSearchResults([]);
      return;
    }
    const foundIds = messages
      .filter((msg) => {
        // Tìm cả tin nhắn thường và forward
        let text = msg.text ?? "";
        if (typeof text === "string") {
          // Nếu là JSON forward thì lấy text gốc để search
          try {
            const parsed = JSON.parse(text);
            if (parsed.forward && parsed.text) {
              text = parsed.text;
            }
          } catch {}
        }
        return text.toLowerCase().includes(searchText.toLowerCase());
      })
      .map((msg) => msg.eventId);
    setSearchResults(foundIds);
  }, [searchText, messages]);
  const handleResultClick = (eventId: string) => {
    setSearchText(""); // Ẩn bảng kết quả
    router.replace(`/chat/${roomId}?searching=true&highlight=${eventId}`);
  };

  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container || isLoadingMore || !hasMoreByRoom[roomId] || !client)
      return;

    if (container.scrollTop < 100) {
      setIsLoadingMore(true);
      prevScrollHeightRef.current = container.scrollHeight;

      try {
        const newEvents = await getOlderMessages(roomId, client);
        if (newEvents.length === 0) {
          setHasMoreByRoom((prev) => ({ ...prev, [roomId]: false }));
        } else {
          const mappedMsgs = convertEventsToMessages(newEvents).map((msg) => ({
            ...msg,
            status: msg.status as MessageStatus,
            body: msg.text ?? "",
            forwarded:
              "forwarded" in msg ? (msg as any).forwarded ?? false : false, // Ensure 'forwarded' property exists
            originalSender:
              "originalSender" in msg
                ? (msg as any).originalSender ?? undefined
                : undefined, // Ensure 'originalSender' property exists
          }));
          prependMessages(roomId, mappedMsgs);
          const oldest = mappedMsgs[0]?.eventId;
          setOldestEventId(roomId, oldest || null);
        }
      } catch (error) {
        console.error("Failed to load older messages:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // ✅ Scroll vào highlight sau khi render dropdown search
  useEffect(() => {
    if (highlightId && firstHighlightedRef.current) {
      setTimeout(() => {
        firstHighlightedRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // delay để tránh bị che bởi dropdown
    } else if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, highlightId]);

  const filteredMessages = searchText.trim()
    ? messages.filter((msg) => {
        // Loại forward: flag hoặc text là JSON forward
        if ("forwarded" in msg && (msg as any).forwarded) return false;
        if (typeof msg.text === "string") {
          try {
            const parsed = JSON.parse(msg.text);
            if (parsed.forward && parsed.text && parsed.originalSender)
              return false;
          } catch {}
        }
        return msg.text?.toLowerCase().includes(searchText.toLowerCase());
      })
    : messages;
  const groupedFiltered = groupMessagesByDate(filteredMessages);

  return (
    <div className="flex flex-col h-full">
      {searching && (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-2">
          {/* Khối search input */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="flex-1 pl-9 py-2 rounded-xl bg-black/90 text-white placeholder:text-gray-400 focus:outline-none border border-gray-700 w-full"
                placeholder="Search this chat"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              {searchText && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  onClick={() => {
                    setSearchText("");
                    setTimeout(() => {
                      messagesEndRef?.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }, 100);
                  }}
                  aria-label="Clear search"
                >
                  &#10005;
                </button>
              )}
            </div>
            <button
              className="text-blue-500 dark:text-blue-400 text-sm font-medium shrink-0"
              onClick={() => {
                setSearchText("");
                router.replace(`/chat/${roomId}`);
              }}
            >
              Cancel
            </button>
          </div>
          <div
            className="absolute left-0 right-0 top-full mt-0
        bg-white dark:bg-black/90 rounded-lg shadow
        overflow-y-auto
        max-h-[160px] md:max-h-[240px]
        border border-gray-200 dark:border-gray-700
        z-20"
          >
            {searchText &&
              (searchResults.length === 0 ? (
                <div className="p-2 text-gray-400 dark:text-gray-500">
                  No results
                </div>
              ) : (
                searchResults.map((id) => {
                  const msg = messages.find((m) => m.eventId === id);
                  let displayText = msg?.text ?? "";
                  let isForward = false;
                  let originalSender = "";

                  // Chỉ kiểm tra forward qua JSON trong text
                  if (typeof msg?.text === "string") {
                    try {
                      const parsed = JSON.parse(msg.text);
                      if (
                        parsed.forward &&
                        parsed.text &&
                        parsed.originalSender
                      ) {
                        isForward = true;
                        displayText = parsed.text;
                        originalSender = parsed.originalSender;
                      }
                    } catch {
                      // Không phải forward
                    }
                  }

                  return (
                    <button
                      key={id}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleResultClick(id)}
                    >
                      {isForward ? (
                        <span className="italic text-gray-500">
                          Forwarded from{" "}
                          <span className="font-semibold">
                            {originalSender}
                          </span>
                          :{" "}
                          <span className="text-black dark:text-white">
                            {displayText}
                          </span>
                        </span>
                      ) : (
                        displayText
                      )}
                    </button>
                  );
                })
              ))}
          </div>
        </div>
      )}

      <div
        className="py-1 px-4 flex-1 overflow-y-auto"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {Object.entries(groupedFiltered).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-sm my-1.5">
              <p className="bg-gray-900/15 rounded-full backdrop-blur-2xl text-white inline-block py-1 px-2">
                {dateLabel}
              </p>
            </div>
            {msgs.map((msg) => {
              const isHighlighted = msg.eventId === highlightId;
              return (
                <div
                  key={msg.eventId}
                  ref={isHighlighted ? firstHighlightedRef : null}
                >
                  <ChatMessage msg={msg} />
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isLoadingMore && (
          <div className="text-center text-gray-400 dark:text-gray-500">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
