import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware';


interface UserInfo{
    displayName: string
}

interface User {
    user: UserInfo | null
    setUser: (data: UserInfo) => void,
    clearUser: () => void,
}

export const useUserStore = create<User>()(
    persist(
        (set) => ({
            user: null,
            setUser: (data: UserInfo) => set({user: data}),
            clearUser: () => set({user: null})
        }),
        {
            name: "matrix_user",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

