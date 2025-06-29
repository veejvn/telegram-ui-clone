"use client";

import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { MessageStatus, useChatStore } from "@/stores/useChatStore";
import { getOlderMessages } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { convertEventsToMessages } from "@/utils/chat/convertEventsToMessages";
import { groupMessagesByDate } from "@/utils/chat/groupMessagesByDate";
import { useSearchParams } from "next/navigation";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessages = ({ roomId, messagesEndRef }: ChatMessagesProps) => {
  useTimeline(roomId);
  const client = useMatrixClient();

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const { prependMessages, setOldestEventId } = useChatStore();
  const messages = messagesByRoom[roomId] ?? [];
  const grouped = groupMessagesByDate(messages);

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const firstHighlightedRef = useRef<HTMLDivElement | null>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreByRoom, setHasMoreByRoom] = useState<{
    [roomId: string]: boolean;
  }>({});

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = React.useRef<number | null>(null);

  useEffect(() => {
    setHasMoreByRoom((prev) => ({
      ...prev,
      [roomId]: true,
    }));
  }, [roomId]);

  // 2. Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (!isLoadingMore && messagesEndRef?.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [messages.length, isLoadingMore, messagesEndRef]);

  // 3. Khôi phục vị trí scroll sau khi thêm tin nhắn cũ
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (isLoadingMore && prevScrollHeightRef.current !== null && container) {
      container.scrollTop +=
        container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null; // Reset ref
    }
  }, [messages.length, isLoadingMore]); // Chạy khi tin nhắn được thêm vào

  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container || isLoadingMore || !hasMoreByRoom[roomId] || !client)
      return;

    if (container.scrollTop < 100) {
      setIsLoadingMore(true);
      prevScrollHeightRef.current = container.scrollHeight; // SỬA LỖI UX: Lưu vị trí scroll cũ

      try {
        const newEvents = await getOlderMessages(roomId, client);
        if (newEvents.length === 0) {
          setHasMoreByRoom((prev) => ({ ...prev, [roomId]: false }));
        } else {
          const mappedMsgs = convertEventsToMessages(newEvents).map((msg) => ({
            ...msg,
            status: msg.status as MessageStatus,
          }));
          prependMessages(roomId, mappedMsgs);
          const oldest = mappedMsgs[0]?.eventId;
          setOldestEventId(roomId, oldest || null);
        }
      } catch (error) {
        console.error("Failed to load older messages:", error);
      } finally {
        setIsLoadingMore(false); // SỬA LỖI: Đảm bảo luôn được gọi
      }
    }
  };

  useEffect(() => {
    if (highlightId && firstHighlightedRef.current) {
      firstHighlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, highlightId]);

  return (
    <>
      <div
        className="py-1 px-4"
        ref={containerRef}
        onScroll={handleScroll}
        // style={{ overflowY: "auto", height: "100%" }}
      >
        {Object.entries(grouped).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="text-center text-sm my-1.5">
              <p
                className=" bg-gray-900/15 rounded-full backdrop-blur-2xl 
                text-white inline-block py-1 px-2"
              >
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
          <div className="text-center text-gray-400">Loading more...</div>
        )}
      </div>
    </>
  );
};

export default ChatMessages;
