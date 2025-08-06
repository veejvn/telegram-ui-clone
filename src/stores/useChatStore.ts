import { FileInfo, ImageInfo } from "@/types/chat";
import { Metadata } from "@/utils/chat/send-message/getVideoMetadata";
import { create } from "zustand";

export type MessageStatus = "sending" | "sent" | "read";
export type MessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "emoji"
  | "location"
  | "audio"
  | "sticker";

export type Message = {
  eventId: string;
  sender: string | undefined;
  senderDisplayName?: string | undefined;
  senderAvatarUrl?: string | null;
  text: string;
  time: string;
  timestamp?: number;
  imageUrl?: string | null;
  imageInfo?: ImageInfo | null;
  videoUrl?: string | null;
  videoInfo?: Metadata | null;
  fileUrl?: string | null;
  fileInfo?: FileInfo | null;
  audioUrl?: string | null;
  audioDuration?: number | null; // ← thêm (đơn vị giây)
  status: MessageStatus;
  type?: MessageType;
  isForward?: boolean;
  isReply?: boolean;
  isStickerAnimation?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  location?: {
    latitude: number | null;
    longitude: number | null;
    description?: string;
  };
  replyTo?: {
    eventId: string;
    text: string;
    sender: string;
    senderDisplayName: string;
  };
};

type ChatStore = {
  messagesByRoom: Record<string, Message[]>;
  isLoadingMoreByRoom: Record<string, boolean>;
  hasMoreByRoom: Record<string, boolean>;
  oldestEventIdByRoom: Record<string, string | null>;

  lastSeenByRoom: Record<string, Record<string, number>>;
  addMessage: (roomId: string, msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  prependMessages: (roomId: string, msgs: Message[]) => void;

  setIsLoadingMore: (roomId: string, isLoading: boolean) => void;
  setHasMore: (roomId: string, hasMore: boolean) => void;
  setOldestEventId: (roomId: string, eventId: string | null) => void;
  updateMessage: (
    roomId: string,
    eventId: string,
    updates: Partial<Message>
  ) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByRoom: {},
  isLoadingMoreByRoom: {},
  hasMoreByRoom: {},
  oldestEventIdByRoom: {},
  lastSeenByRoom: {},

  addMessage: (roomId, msg) => {
    const current = get().messagesByRoom[roomId] || [];

    // Nếu là eventId thật, tìm local message cùng sender và text
    if (!msg.eventId.startsWith("local_")) {
      const idx = current.findIndex(
        (m) =>
          m.sender === msg.sender &&
          m.text === msg.text &&
          m.eventId.startsWith("local_")
      );
      if (idx !== -1) {
        // Cập nhật local message thành message thật
        const updated = [...current];
        updated[idx] = { ...msg, status: "sent" as MessageStatus };
        set({
          messagesByRoom: {
            ...get().messagesByRoom,
            [roomId]: updated,
          },
        });
        return; // Quan trọng: return để không thêm message mới
      }
    }

    // Lọc trùng eventId như cũ
    if (current.some((m) => m.eventId === msg.eventId)) return;

    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: [...current, msg],
      },
    });
  },

  setMessages: (roomId, msgs) => {
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: msgs,
      },
    });
  },

  prependMessages: (roomId, msgs) => {
    const current = get().messagesByRoom[roomId] || [];
    const merged = [...msgs, ...current].filter(
      (msg, index, self) =>
        index === self.findIndex((m) => m.eventId === msg.eventId)
    );

    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: merged,
      },
    });
  },

  setIsLoadingMore: (roomId, isLoading) => {
    set({
      isLoadingMoreByRoom: {
        ...get().isLoadingMoreByRoom,
        [roomId]: isLoading,
      },
    });
  },

  setHasMore: (roomId, hasMore) => {
    set({
      hasMoreByRoom: {
        ...get().hasMoreByRoom,
        [roomId]: hasMore,
      },
    });
  },

  setOldestEventId: (roomId, eventId) => {
    set({
      oldestEventIdByRoom: {
        ...get().oldestEventIdByRoom,
        [roomId]: eventId,
      },
    });
  },

  updateMessage: (
    roomId: string,
    eventId: string,
    updates: Partial<Message>
  ) => {
    //console.log("Cập nhật tin nhắn trong useChatStore", roomId, eventId, updates);
    const current = get().messagesByRoom[roomId] || [];
    const updated = current.map((msg) =>
      msg.eventId === eventId ? { ...msg, ...updates } : msg
    );
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: updated,
      },
    });
  },
}));
