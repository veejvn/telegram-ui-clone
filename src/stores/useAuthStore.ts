import { getCookie } from "@/utils/cookie";
import { normalizeMatrixUserId, isValidMatrixUserId } from "@/utils/matrixHelpers";
import { create } from 'zustand'

interface AuthState {
    isLogging: boolean
    accessToken: string | null
    userId: string | null,
    deviceId: string | null,
    login: (accessToken: string, userId: string, deviceId: string) => void
    logout: () => void
    getNormalizedUserId: () => string | null
}

// Kiểm tra env variable
if (!process.env.NEXT_PUBLIC_MATRIX_BASE_URL) {
    throw new Error("NEXT_PUBLIC_MATRIX_BASE_URL is required");
}

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL;

export const useAuthStore = create<AuthState>((set, get) => {
    const storedToken: string | null = typeof window !== 'undefined' ? (getCookie("matrix_token") ?? null) : null
    const rawUserId: string | null = typeof window !== 'undefined' ? (getCookie("matrix_user_id") ?? null) : null
    const storedDeviceId: string | null = typeof window !== 'undefined' ? (getCookie("matrix_device_id") ?? null) : null

    // Normalize user ID if it exists
    let normalizedUserId: string | null = null;
    if (rawUserId) {
        normalizedUserId = normalizeMatrixUserId(rawUserId, HOMESERVER_URL);
        // Validate normalized user ID
        if (!isValidMatrixUserId(normalizedUserId)) {
            console.error("Invalid Matrix User ID format:", normalizedUserId);
            normalizedUserId = null;
        }
    }

    return {
        isLogging: !!storedToken && !!normalizedUserId,
        accessToken: storedToken,
        userId: normalizedUserId,
        deviceId: storedDeviceId,

        login: (accessToken, userId, deviceId) => {
            // Kiểm tra nếu userId đã có format hợp lệ thì dùng nguyên bản
            let finalUserId = userId;
            
            // Chỉ normalize nếu userId chưa có domain
            if (userId && !userId.includes(':')) {
                finalUserId = normalizeMatrixUserId(userId, HOMESERVER_URL);
            }
            
            // Validate final user ID
            if (isValidMatrixUserId(finalUserId)) {
                //console.log("🔐 Auth store login:", { accessToken: "***", userId: finalUserId, deviceId });
                set({ isLogging: true, accessToken, userId: finalUserId, deviceId });
            } else {
                console.error("Cannot login with invalid user ID:", finalUserId);
                set({ isLogging: false, accessToken: null, userId: null, deviceId: null });
            }
        },

        logout: () => {
            set({ isLogging: false, accessToken: null, userId: null, deviceId: null })
        },

        getNormalizedUserId: () => {
            const state = get();
            return state.userId;
        }
    }
})