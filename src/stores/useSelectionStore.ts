import { create } from "zustand";

interface SelectionState {
  // Selection mode state
  isSelectionMode: boolean;
  selectedMessages: string[]; // Array of message IDs

  // Actions
  setSelectionMode: (mode: boolean) => void;
  toggleMessage: (messageId: string) => void;
  selectMessage: (messageId: string) => void;
  deselectMessage: (messageId: string) => void;
  clearSelection: () => void;
  isMessageSelected: (messageId: string) => boolean;

  // Enter selection mode with first message
  enterSelectionMode: (firstMessageId: string) => void;

  // Exit selection mode and clear all
  exitSelectionMode: () => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  // Initial state
  isSelectionMode: false,
  selectedMessages: [],

  // Actions
  setSelectionMode: (mode: boolean) =>
    set((state) => ({
      isSelectionMode: mode,
      // Clear selection when exiting selection mode
      selectedMessages: mode ? state.selectedMessages : [],
    })),

  toggleMessage: (messageId: string) =>
    set((state) => {
      const newSelectedMessages = state.selectedMessages.includes(messageId)
        ? state.selectedMessages.filter((id) => id !== messageId)
        : [...state.selectedMessages, messageId];

      // Nếu không còn tin nhắn nào được chọn, tự động thoát selection mode
      const newIsSelectionMode = newSelectedMessages.length > 0;

      return {
        selectedMessages: newSelectedMessages,
        isSelectionMode: newIsSelectionMode,
      };
    }),

  selectMessage: (messageId: string) =>
    set((state) => ({
      selectedMessages: state.selectedMessages.includes(messageId)
        ? state.selectedMessages
        : [...state.selectedMessages, messageId],
    })),

  deselectMessage: (messageId: string) =>
    set((state) => {
      const newSelectedMessages = state.selectedMessages.filter(
        (id) => id !== messageId
      );

      // Nếu không còn tin nhắn nào được chọn, tự động thoát selection mode
      const newIsSelectionMode = newSelectedMessages.length > 0;

      return {
        selectedMessages: newSelectedMessages,
        isSelectionMode: newIsSelectionMode,
      };
    }),

  clearSelection: () =>
    set({
      selectedMessages: [],
      isSelectionMode: false, // Tự động thoát selection mode khi clear selection
    }),

  isMessageSelected: (messageId: string) =>
    get().selectedMessages.includes(messageId),

  enterSelectionMode: (firstMessageId: string) =>
    set({
      isSelectionMode: true,
      selectedMessages: [firstMessageId],
    }),

  exitSelectionMode: () =>
    set({
      isSelectionMode: false,
      selectedMessages: [],
    }),
}));
