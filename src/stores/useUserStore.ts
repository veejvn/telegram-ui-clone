import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserInfo {
    displayName: string;
    avatarUrl?: string;
}

interface User {
    user: UserInfo | null;
    setUser: (data: Partial<UserInfo>) => void;
    clearUser: () => void;
}


export const useUserStore = create<User>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (data) => {
                const current = get().user;
                set({
                    user: {
                        ...current,     // giữ thông tin cũ
                        ...data,        // cập nhật mới
                    } as UserInfo,
                });
            },
            clearUser: () => set({ user: null }),
        }),
        {
            name: "matrix-user",
            storage: typeof window !== "undefined"
                ? createJSONStorage(() => localStorage)
                : undefined,
            // Optional: hạn chế lỗi khi deserialize sai format
            partialize: (state) => ({ user: state.user }),
        }
    )
);