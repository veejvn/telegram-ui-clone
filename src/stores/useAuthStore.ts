import { getLS, setLS } from "@/tools/localStorage.tool";
import { normalizeMatrixUserId, isValidMatrixUserId } from "@/utils/matrixHelpers";
import { create } from 'zustand'

interface AuthState {
    isLoggedIn: boolean
    accessToken: string | null
    userId: string | null,
    deviceId: string | null,
    login: (accessToken: string, userId: string, deviceId: string) => void
    logout: () => void
    getNormalizedUserId: () => string | null
    setAuth: (accessToken: string, userId: string, deviceId: string) => void
    validateAuth: () => boolean
}

// Kiểm tra env variable
if (!process.env.NEXT_PUBLIC_MATRIX_BASE_URL) {
    throw new Error("NEXT_PUBLIC_MATRIX_BASE_URL is required");
}

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL;

export const useAuthStore = create<AuthState>(
    (set, get) => {
    const storedIsLoggedIn = getLS("isLoggedIn") || false;
    return {
        accessToken: "",
        userId: "",
        deviceId: "",
        isLoggedIn: storedIsLoggedIn,
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
                set({ isLoggedIn: true, accessToken, userId: finalUserId, deviceId });
                setLS("isLoggedIn", true)
            } else {
                console.error("Cannot login with invalid user ID:", finalUserId);
                set({ isLoggedIn: false, accessToken: null, userId: null, deviceId: null });
                setLS("isLoggedIn", false)
            }
        },
        logout: () => {
            set({ isLoggedIn: false, accessToken: null, userId: null, deviceId: null })
            //setLS("isLoggedIn", false)
        },
        getNormalizedUserId: () => {
            const state = get();
            return state.userId;
        },
        setAuth: (accessToken, userId, deviceId) => {
            // ✅ Validation: Kiểm tra input
            if (!accessToken || !userId || !deviceId) {
                console.error("setAuth: Missing required parameters", {
                    hasToken: !!accessToken,
                    hasUserId: !!userId,
                    hasDeviceId: !!deviceId
                });
                return;
            }

            let finalUserId = userId;
            
            // Chỉ normalize nếu userId chưa có domain
            if (userId && !userId.includes(':')) {
                finalUserId = normalizeMatrixUserId(userId, HOMESERVER_URL);
            }
            
            // Validate final user ID
            if (isValidMatrixUserId(finalUserId)) {
                //console.log("🔐 Auth store setAuth:", { accessToken: "***", userId: finalUserId, deviceId });
                set({ isLoggedIn: true, accessToken, userId: finalUserId, deviceId });
                setLS("isLoggedIn", true)
            } else {
                //console.error("Cannot setAuth with invalid user ID:", finalUserId);
                set({ isLoggedIn: false, accessToken: null, userId: null, deviceId: null });
                setLS("isLoggedIn", false)
            }
        },
        validateAuth: () => {
            const state = get();
            return !!(state.accessToken && state.userId && state.deviceId && state.isLoggedIn);
        }
    }
})