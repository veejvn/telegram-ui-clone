import { create } from "zustand";

export type MessageStatus = "sending" | "sent" | "read";
export type MessageType = "text" | "image" | "video" | "file" | "emoji"

export type Message = {
  eventId: string;
  time: string;
  senderDisplayName?: string | undefined,
  sender: string | undefined;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  status: MessageStatus;
  type?: MessageType;
};

type ChatStore = {
  messagesByRoom: Record<string, Message[]>;
  lastSeenByRoom: Record<string, Record<string, number>>;
  addMessage: (roomId: string, msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  updateMessageStatus: (roomId: string, localId: string | null, eventId: string, status: MessageStatus) => void;
  updateLastSeen: (roomId: string, userId: string, timestamp: number) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByRoom: {},
  lastSeenByRoom: {},

  addMessage: (roomId, msg) => {
    const current = get().messagesByRoom[roomId] || [];

    if (current.some((m) => m.eventId === msg.eventId)) return;

    set({
      messagesByRoom: { ...get().messagesByRoom, [roomId]: [...current, msg] },
    });
  },

  setMessages(roomId, msgs) {
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: msgs,
      },
    });
  },

  updateMessageStatus: (roomId, localId, eventId, status) => {
    const messages = get().messagesByRoom[roomId] || [];
    return {
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: messages.map(msg =>
          (msg.eventId === localId || msg.eventId === eventId)
            ? { ...msg, eventId, status }
            : msg
        ),
      },
    };
  },
  updateLastSeen: (roomId, userId, timestamp) => {
    set((state) => {
      const roomLastSeen = state.lastSeenByRoom[roomId] || {};
      return {
        lastSeenByRoom: {
          ...state.lastSeenByRoom,
          [roomId]: {
            ...roomLastSeen,
            [userId]: Math.max(roomLastSeen[userId] || 0, timestamp),
          },
        },
      };
    });
  },
}));
