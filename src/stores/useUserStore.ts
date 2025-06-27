import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserInfo {
  displayName: string;
}

interface User {
  user: UserInfo | null;
  setUser: (data: UserInfo) => void;
  clearUser: () => void; // ✅ Thêm hàm clearUser
}

export const useUserStore = create<User>()(
  persist(
    (set) => ({
      user: null,
      setUser: (data: UserInfo) => set({ user: data }),
      clearUser: () => set({ user: null }), // ✅ Reset user về null
    }),
    {
      name: "matrix-user",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
);
