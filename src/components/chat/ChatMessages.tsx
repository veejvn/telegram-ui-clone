"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { MessageStatus, useChatStore } from "@/stores/useChatStore";
import { getOlderMessages } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { convertEventsToMessages } from "@/utils/chat/convertEventsToMessages";
import { groupMessagesByDate } from "@/utils/chat/groupMessagesByDate";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { MessageMenuProvider } from "@/contexts/MessageMenuContext";
import GroupSharingInterface from "./GroupSharingInterface";
import * as sdk from "matrix-js-sdk";
import { usePinnedMessageSync } from "@/hooks/usePinnedMessageSync";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  room?: sdk.Room;
};

const ChatMessages = ({ roomId, messagesEndRef, room }: ChatMessagesProps) => {
  //console.log("Room Id in ChatMessages: " + roomId)
  useTimeline(roomId);
  usePinnedMessageSync(roomId); // Sync pinned messages
  const client = useMatrixClient();
  const router = useRouter();

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const { prependMessages, setOldestEventId } = useChatStore();
  const messages = messagesByRoom[roomId] ?? [];
  const grouped = groupMessagesByDate(messages);

  // Check if this is a group chat
  const joinRuleEvent = room?.currentState.getStateEvents(
    "m.room.join_rules",
    ""
  );
  const joinRule = joinRuleEvent?.getContent()?.join_rule;
  const isGroup = joinRule === "public";

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight") ?? null;
  const searching = searchParams.get("searching") === "true";
  const [searchText, setSearchText] = useState("");
  const firstHighlightedRef = useRef<HTMLDivElement | null>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreByRoom, setHasMoreByRoom] = useState<{
    [roomId: string]: boolean;
  }>({});
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasMoreByRoom((prev) => ({
      ...prev,
      [roomId]: true,
    }));

    // Cleanup timeout when roomId changes
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [roomId]);

  // Debug effect để kiểm tra container ref và tìm scroll container thực tế
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Tìm scroll container thực tế (có thể là ScrollArea viewport)
      let scrollContainer: HTMLElement = container;
      let parent = container.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      // Attach scroll event to the actual scroll container
      const handleScrollEvent = () => {
        // Chỉ update shouldAutoScroll khi KHÔNG đang loading more
        if (!isLoadingMore) {
          const isNearBottom =
            scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight - 100;
          setShouldAutoScroll(isNearBottom);
        }

        handleScrollThrottled();
      };

      scrollContainer.addEventListener("scroll", handleScrollEvent);

      return () => {
        scrollContainer.removeEventListener("scroll", handleScrollEvent);
      };
    }
  }, [containerRef.current, messages.length, isLoadingMore]);

  // Auto scroll to bottom when new message (but NOT when loading older messages)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  useEffect(() => {
    // Chỉ auto scroll khi:
    // 1. Không đang loading more
    // 2. shouldAutoScroll = true (người dùng ở gần bottom)
    // 3. Có message mới (messages.length tăng so với lần trước)
    // 4. Không phải từ việc load old messages (prepend)
    // 5. Không đang restore scroll position

    const isNewMessage = messages.length > lastMessageCount;
    const isAddingOldMessages = isLoadingOldMessages;

    // Không auto scroll nếu đang load tin nhắn cũ hoặc đang restore scroll
    if (
      !isLoadingMore &&
      !isAddingOldMessages &&
      !isRestoringScroll &&
      shouldAutoScroll &&
      isNewMessage &&
      messagesEndRef?.current
    ) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }

    // Cập nhật count sau khi xử lý - CHỈ KHI THỰC SỰ CÓ THAY ĐỔI
    if (messages.length !== lastMessageCount) {
      setLastMessageCount(messages.length);
    }
  }, [
    messages.length,
    isLoadingMore,
    shouldAutoScroll,
    messagesEndRef,
    isLoadingOldMessages,
    isRestoringScroll,
  ]); // Restore scroll position after loading old messages
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prevScrollHeightRef.current === null) return;

    // Đánh dấu đang restore scroll
    setIsRestoringScroll(true);

    // Tìm scroll container thực tế
    let scrollContainer: HTMLElement = container;
    let parent = container.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const heightDiff =
      scrollContainer.scrollHeight - prevScrollHeightRef.current;
    scrollContainer.scrollTop += heightDiff;

    prevScrollHeightRef.current = null;

    // Tạm thời disable auto scroll để không bị đẩy về bottom
    setShouldAutoScroll(false);

    // Enable lại sau khi scroll restore hoàn tất
    setTimeout(() => {
      setShouldAutoScroll(true);
      setIsRestoringScroll(false);
    }, 300);
  }, [messages.length]);

  // Tìm các eventId chứa searchText (bỏ qua forward)
  const searchResults = useMemo(() => {
    if (!searchText) {
      return [];
    }
    return messages
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
  }, [searchText, messages]);

  const handleResultClick = (eventId: string) => {
    setSearchText(""); // Ẩn bảng kết quả
    router.replace(`/chat/${roomId}?searching=true&highlight=${eventId}`);
  };

  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Tìm scroll container thực tế
    let scrollContainer: HTMLElement = container;
    let parent = container.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (isLoadingMore || !hasMoreByRoom[roomId] || !client) {
      return;
    }

    // Kiểm tra nếu scroll gần đến top
    const isNearTop = scrollContainer.scrollTop < 200;

    if (isNearTop) {
      setIsLoadingMore(true);
      setIsLoadingOldMessages(true);

      // Tìm scroll container thực tế và lưu scroll position
      let scrollContainer: HTMLElement = container;
      let parent = container.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          scrollContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      prevScrollHeightRef.current = scrollContainer.scrollHeight;

      try {
        const newEvents = await getOlderMessages(roomId, client, 50);

        if (newEvents.length === 0) {
          console.log("📭 No more messages to load");
          setHasMoreByRoom((prev) => ({ ...prev, [roomId]: false }));
        } else {
          const mappedMsgs = convertEventsToMessages(newEvents, client).map(
            (msg) => ({
              ...msg,
              status: msg.status as MessageStatus,
              body: msg.text ?? "",
              forwarded:
                "forwarded" in msg ? (msg as any).forwarded ?? false : false,
              originalSender:
                "originalSender" in msg
                  ? (msg as any).originalSender ?? undefined
                  : undefined,
            })
          );

          prependMessages(roomId, mappedMsgs);
          const oldest = mappedMsgs[0]?.eventId;
          setOldestEventId(roomId, oldest || null);
        }
      } catch (error) {
        console.error("❌ Failed to load older messages:", error);
        // Reset hasMore để có thể thử lại
        setHasMoreByRoom((prev) => ({ ...prev, [roomId]: true }));
      } finally {
        setIsLoadingMore(false);
        setTimeout(() => {
          setIsLoadingOldMessages(false);
        }, 200);
      }
    }
  };

  // Throttled scroll handler
  const handleScrollThrottled = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      handleScroll();
    }, 100);
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
    }
    // KHÔNG auto scroll về bottom ở đây nữa - để auto scroll logic khác xử lý
  }, [highlightId]); // Chỉ depend vào highlightId, không depend vào messages

  // Initial scroll to bottom when component mounts or room changes
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef?.current && !highlightId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [roomId]);

  // Handle manual highlight events (for pinned messages and reply navigation)
  useEffect(() => {
    const handleManualHighlight = (event: CustomEvent) => {
      const { eventId } = event.detail;
      if (eventId) {
        const targetElement = document.querySelector(
          `[data-message-id="${eventId}"]`
        );
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    };

    window.addEventListener(
      "manualHighlight",
      handleManualHighlight as EventListener
    );

    return () => {
      window.removeEventListener(
        "manualHighlight",
        handleManualHighlight as EventListener
      );
    };
  }, []);

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
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
          {/* Khối search input */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="flex-0 pl-9 py-2 rounded-xl bg-white dark:bg-[#18181b] text-black dark:text-white placeholder:text-gray-400 focus:outline-none border border-gray-300 dark:border-gray-700 w-full"
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

      <MessageMenuProvider>
        <div className="py-1 px-4 flex-1 overflow-y-auto" ref={containerRef}>
          {isLoadingMore && (
            <div className="text-center py-4 text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              Loading older messages...
            </div>
          )}
          {/* Show group sharing interface for group chats */}
          {isGroup && room && (
            <GroupSharingInterface
              roomName={room.name || "Group"}
              memberCount={room.getJoinedMembers().length}
              creationDate={(() => {
                const createEvent = room.currentState.getStateEvents(
                  "m.room.create",
                  ""
                );
                const timestamp = createEvent?.getTs(); // ✅ dùng getTs()

                if (timestamp) {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const isToday = date.toDateString() === now.toDateString();

                  if (isToday) {
                    return `Today ${date
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${date
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`;
                  } else {
                    return date.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  }
                }
                return undefined;
              })()}
              creatorName={
                room.currentState
                  .getStateEvents("m.room.create", "")
                  ?.getSender()
                  ?.replace(/^@/, "")
                  ?.split(":")[0] || "Unknown"
              }
            />
          )}

          {Object.entries(groupedFiltered).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              <div className="text-center text-[10px] leading-[140%] tracking-normal my-1.5 font-normal">
                <p className="rounded-full backdrop-blur-2xl text-[#6B7271] inline-block py-1 px-2 select-none align-middle">
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
                    <ChatMessage msg={msg} roomId={roomId} />
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
      </MessageMenuProvider>
    </div>
  );
};

export default ChatMessages;
