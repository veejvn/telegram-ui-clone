import { getLS } from '@/tools/localStorage.tool'
import { create } from 'zustand'
import { getCookie } from '@/tools/cookie.tool'

interface AuthState {
    isLogging: boolean
    accessToken: string | null
    userId: string | null,
    deviceId: string | null,
    login: (accessToken: string, userId: string, deviceId: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
    const storedToken = typeof window !== 'undefined' ? getCookie("matrix_access_token") : null
    const storedUserId = typeof window !== 'undefined' ? getCookie("matrix_user_id") : null
    const storedDeviceId = typeof window !== 'undefined' ? getCookie("matrix_device_id") : null

    return {
        isLogging: !!storedToken,
        accessToken: storedToken ?? null,
        userId: storedUserId,
        deviceId: storedDeviceId,

        login: (accessToken, userId, deviceId) => {
            set({ isLogging: true, accessToken, userId, deviceId })
        },

        logout: () => {
            set({ isLogging: false, accessToken: null, userId: null, deviceId: null })
        },
    }
})
