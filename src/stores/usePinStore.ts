import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PinnedMessage {
  eventId: string;
  text: string;
  sender: string;
  senderDisplayName?: string;
  time: string;
  timestamp?: number;
  type: string;
  roomId: string;
  pinnedAt: number; // timestamp khi pin
}

interface PinStore {
  // Map từ roomId -> array các tin nhắn đã pin
  pinnedMessagesByRoom: Record<string, PinnedMessage[]>;

  // Pin một tin nhắn
  pinMessage: (roomId: string, message: PinnedMessage) => void;

  // Unpin một tin nhắn
  unpinMessage: (roomId: string, eventId: string) => void;

  // Kiểm tra xem tin nhắn có bị pin không
  isMessagePinned: (roomId: string, eventId: string) => boolean;

  // Lấy tin nhắn đã pin theo room
  getPinnedMessages: (roomId: string) => PinnedMessage[];

  // Xóa tất cả tin nhắn đã pin trong room
  clearPinnedMessages: (roomId: string) => void;

  // Lấy tin nhắn đã pin mới nhất trong room
  getLatestPinnedMessage: (roomId: string) => PinnedMessage | null;
}

export const usePinStore = create<PinStore>()(
  persist(
    (set, get) => ({
      pinnedMessagesByRoom: {},

      pinMessage: (roomId: string, message: PinnedMessage) => {
        const current = get().pinnedMessagesByRoom[roomId] || [];

        // Kiểm tra xem tin nhắn đã pin chưa
        if (current.find((m) => m.eventId === message.eventId)) {
          return; // Đã pin rồi
        }

        // Thêm tin nhắn vào đầu danh sách (mới nhất trước)
        const updated = [message, ...current];

        set({
          pinnedMessagesByRoom: {
            ...get().pinnedMessagesByRoom,
            [roomId]: updated,
          },
        });
      },

      unpinMessage: (roomId: string, eventId: string) => {
        const current = get().pinnedMessagesByRoom[roomId] || [];
        const filtered = current.filter((m) => m.eventId !== eventId);

        set({
          pinnedMessagesByRoom: {
            ...get().pinnedMessagesByRoom,
            [roomId]: filtered,
          },
        });
      },

      isMessagePinned: (roomId: string, eventId: string) => {
        const current = get().pinnedMessagesByRoom[roomId] || [];
        return current.some((m) => m.eventId === eventId);
      },

      getPinnedMessages: (roomId: string) => {
        return get().pinnedMessagesByRoom[roomId] || [];
      },

      clearPinnedMessages: (roomId: string) => {
        set({
          pinnedMessagesByRoom: {
            ...get().pinnedMessagesByRoom,
            [roomId]: [],
          },
        });
      },

      getLatestPinnedMessage: (roomId: string) => {
        const pinned = get().pinnedMessagesByRoom[roomId] || [];
        return pinned.length > 0 ? pinned[0] : null;
      },
    }),
    {
      name: "telegram-pin-store",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        pinnedMessagesByRoom: state.pinnedMessagesByRoom,
      }),
    }
  )
);
