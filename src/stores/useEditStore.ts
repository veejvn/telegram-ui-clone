import { create } from "zustand";

export interface EditMessage {
  eventId: string;
  text: string;
  roomId: string;
}

interface EditStore {
  editMessage: EditMessage | null;
  isEditing: boolean;

  // Actions
  setEditMessage: (message: EditMessage) => void;
  clearEditMessage: () => void;
  updateEditText: (text: string) => void;
}

export const useEditStore = create<EditStore>((set) => ({
  editMessage: null,
  isEditing: false,

  setEditMessage: (message: EditMessage) =>
    set({
      editMessage: message,
      isEditing: true,
    }),

  clearEditMessage: () =>
    set({
      editMessage: null,
      isEditing: false,
    }),

  updateEditText: (text: string) =>
    set((state) => ({
      editMessage: state.editMessage ? { ...state.editMessage, text } : null,
    })),
}));
