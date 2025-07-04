import { create } from "zustand";

interface TypingState {
  typingUsers: Record<string, boolean>; // userId -> typing: true/false
  setTyping: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  clearTyping: () => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTyping: (updater) =>
    set((state) => ({ typingUsers: updater(state.typingUsers) })),
  clearTyping: () => set({ typingUsers: {} }),
}));
