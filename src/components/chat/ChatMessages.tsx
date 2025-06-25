"use client";

import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import { useTimeline } from "@/hooks/useTimeline";
import { MessageStatus, useChatStore } from "@/stores/useChatStore";
import { getOlderMessages, getTimeline } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { convertEventsToMessages } from "@/utils/chat/convertEventsToMessages";
import { groupMessagesByDate } from "@/utils/chat/groupMessagesByDate";

type ChatMessagesProps = {
  roomId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessages = ({ roomId, messagesEndRef }: ChatMessagesProps) => {
  useTimeline(roomId);
  const client = useMatrixClient();

  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const { setMessages, prependMessages, setOldestEventId } = useChatStore();
  const messages = messagesByRoom[roomId] ?? [];

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreByRoom, setHasMoreByRoom] = useState<{
    [roomId: string]: boolean;
  }>({});

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = React.useRef<number | null>(null);

  // 1. Khởi tạo timeline và trạng thái hasMore
  useEffect(() => {
    if (!client || !roomId) return;

    setHasMoreByRoom((prev) => ({ ...prev, [roomId]: true })); // SỬA LỖI: Khởi tạo hasMore

    getTimeline(roomId, client).then((res) => {
      if (res.success && res.timeline) {
        setMessages(roomId, res.timeline);
      }
    });
  }, [client, roomId, setMessages]);

  // 2. Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    // Chỉ cuộn xuống khi không phải đang tải tin nhắn cũ
    if (!isLoadingMore && messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, messagesEndRef, isLoadingMore]); // Chạy khi số lượng tin nhắn thay đổi

  // 3. Khôi phục vị trí scroll sau khi thêm tin nhắn cũ
  React.useLayoutEffect(() => {
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

  const grouped = groupMessagesByDate(messages);

  return (
    <>
      <div
        className="py-1 flex flex-col"
        ref={containerRef}
        onScroll={handleScroll}
        style={{ overflowY: "auto", height: "100%" }}
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
            {msgs.map((msg) => (
              <div key={msg.eventId}>
                <ChatMessage msg={msg} />
              </div>
            ))}
          </div>
        ))}

        <div ref={messagesEndRef} />

        {isLoadingMore && (
          <div className="text-center text-gray-400">Loading more...</div>
        )}
        {/* <div className="flex justify-end text-red-500">{lastMessage.status}</div> */}
      </div>
    </>
  );
};

export default ChatMessages;
