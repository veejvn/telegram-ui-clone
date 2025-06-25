import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
    displayName: string;
    status: "online";
    phone?: string;
    avatarUrl?: string;
    homeserver: string;

}

interface UserState {
    user: UserInfo | null;
    setUser: (data: UserInfo) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (data) => set({ user: data }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "matrix_user",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
