// src/store/auth.ts
import { getLS } from '@/tools/localStorage.tool'
import { create } from 'zustand'

interface AuthState {
    isLogging: boolean
    accessToken?: string
    login: (accessToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
    const storedToken = typeof window !== 'undefined' ? getLS("matrix_access_token") : null

    return {
        isLogging: !!storedToken,
        accessToken: storedToken ?? undefined,

        login: (accessToken) => {
            set({ isLogging: true, accessToken })
        },

        logout: () => {
            set({ isLogging: false, accessToken: undefined })
        },
    }
})
