import { getCookie } from "@/utils/cookie";
import { create } from 'zustand'

interface AuthState {
    isLogging: boolean
    accessToken: string | null
    userId: string | null,
    deviceId: string | null,
    login: (accessToken: string, userId: string, deviceId: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
    const storedToken: string | null = typeof window !== 'undefined' ? (getCookie("matrix_token") ?? null) : null
    const storedUserId: string | null = typeof window !== 'undefined' ? (getCookie("matrix_user_id") ?? null) : null
    const storeddeviceId: string | null = typeof window !== 'undefined' ? (getCookie("matrix_device_id") ?? null) : null

    return {
        isLogging: !!storedToken,
        accessToken: storedToken ?? undefined,
        userId: storedUserId,
        deviceId: storeddeviceId,

        login: (accessToken, userId, deviceId) => {
            set({ isLogging: true, accessToken, userId, deviceId })
        },

        logout: () => {
            set({ isLogging: false, accessToken: null, userId: null, deviceId: null })
        },
    }
})
