import { create } from "zustand";

interface ForwardState {
  text: string;
  sender: string;
  roomIdForward: string;
  setForwardData: (data: ForwardState) => void;
  clearForwardData: () => void;
}

export const useForwardStore = create<ForwardState>((set) => ({
  text: "",
  sender: "",
  roomIdForward: "",
  setForwardData: (data) => set({ ...data }),
  clearForwardData: () =>
    set({
      text: "",
      sender: "",
      roomIdForward: "",
    }),
}));
