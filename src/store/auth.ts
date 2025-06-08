// src/store/auth.ts
import { create } from 'zustand'

interface AuthState {
    isLogging: boolean
    token?: string
    login: (token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
    // đọc token cũ (nếu có) từ localStorage
    const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null

    return {
        isLogging: !!storedToken,
        token: storedToken ?? undefined,

        login: (token) => {
            set({ isLogging: true, token })
            localStorage.setItem('token', token)
        },

        logout: () => {
            set({ isLogging: false, token: undefined })
            localStorage.removeItem('token')
        },
    }
})
