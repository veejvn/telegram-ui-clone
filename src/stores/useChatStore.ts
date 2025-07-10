import { create } from "zustand";

export type MessageStatus = "sending" | "sent" | "read";
export type MessageType = "text" | "image" | "video" | "file" | "emoji";

export type Message = {
  eventId: string;
  time: string;
  timestamp?: number;
  senderDisplayName?: string | undefined;
  sender: string | undefined;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  status: MessageStatus;
  type?: MessageType;
  isForward?: boolean;
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
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByRoom: {},
  isLoadingMoreByRoom: {},
  hasMoreByRoom: {},
  oldestEventIdByRoom: {},
  lastSeenByRoom: {},

  addMessage: (roomId, msg) => {
    const current = get().messagesByRoom[roomId] || [];
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
}));
