import { create } from "zustand";

export type Message = {
  eventId: string;
  time: string;
  senderDisplayName: string | undefined,
  sender: string | undefined;
  text: string;
};

type ChatStore = {
  messagesByRoom: Record<string, Message[]>;
  addMessage: (roomId: string, msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
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
}));
