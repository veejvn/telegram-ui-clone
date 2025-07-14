// stores/useForwardStore.ts
import { create } from "zustand";

export type ForwardMessage = {
  text: string;
  senderId: string | undefined;
  sender: string;
  time: string;
};

type ForwardStore = {
  roomIds: string[];
  messages: ForwardMessage[];
  addMessage: (msg: ForwardMessage) => void;
  clearMessages: () => void;
  addRoom: (roomId: string) => void;
  removeRoom: (roomId: string) => void;
  clearRooms: () => void;
};

export const useForwardStore = create<ForwardStore>((set) => ({
  messages: [],
  roomIds: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
  clearMessages: () => set({ messages: [] }),
  addRoom: (roomId) =>
    set((state) => ({
      roomIds: state.roomIds.includes(roomId)
        ? state.roomIds
        : [...state.roomIds, roomId],
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      roomIds: state.roomIds.filter((id) => id !== roomId),
    })),

  clearRooms: () => set(() => ({ roomIds: [] })),
}));
