import { create } from "zustand";

interface IgnoreStore {
  ignoredUsers: string[];
  setIgnoredUsers: (users: string[]) => void;
}

export const useIgnoreStore = create<IgnoreStore>((set) => ({
  ignoredUsers: [],
  setIgnoredUsers: (users) => set({ ignoredUsers: users }),
}));
