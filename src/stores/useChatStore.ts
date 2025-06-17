import { create } from "zustand";

type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type Message = {
  eventId: string;
  time: string;
  senderDisplayName?: string | undefined,
  sender: string | undefined;
  text: string;
  status: MessageStatus;
};

type ChatStore = {
  messagesByRoom: Record<string, Message[]>;
  addMessage: (roomId: string, msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  updateMessageStatus: (roomId: string, localId: string | null, eventId: string, status: MessageStatus) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByRoom: {},

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
  }
}));
