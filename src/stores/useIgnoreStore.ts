import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IgnoreStore {
  ignoredUsers: string[];
  setIgnoredUsers: (users: string[]) => void;
}

export const useIgnoreStore = create<IgnoreStore>()(
  persist(
    (set) => ({
      ignoredUsers: [],
      setIgnoredUsers: (users) => set({ ignoredUsers: users }),
    }),
    {
      name: "ignore-store", // tên key trong localStorage
    }
  )
);