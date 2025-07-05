"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from "@/utils/cookie";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";

export function useAuthProtection() {
    const router = useRouter();
    const isLogging = useAuthStore((state) => state.isLogging);
    const logout = useAuthStore((state) => state.logout);
    const clearUser = useUserStore.getState().clearUser;

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = getCookie("matrix_token");
            const userId = getCookie("matrix_user_id");

            if (!accessToken || !userId) {
                console.log("No access token found, redirecting to login");
                logout();
                clearUser();
                router.replace(ROUTES.LOGIN);
                return;
            }

            // Kiểm tra token validity bằng cách gọi API đơn giản
            const checkTokenValidity = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_MATRIX_BASE_URL}/_matrix/client/v3/account/whoami`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        console.log("Token invalid, logging out...");
                        deleteCookie("matrix_token");
                        deleteCookie("matrix_user_id");
                        deleteCookie("matrix_device_id");
                        logout();
                        clearUser();
                        router.replace(ROUTES.LOGIN);
                    }
                } catch (error) {
                    console.error("Error checking token validity:", error);
                    // Nếu không thể kiểm tra, giữ nguyên trạng thái hiện tại
                }
            };

            // Kiểm tra token mỗi 5 phút
            const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

            // Kiểm tra ngay lập tức
            checkTokenValidity();

            return () => clearInterval(interval);
        };

        if (isLogging) {
            checkAuth();
        }
    }, [isLogging, logout, clearUser, router]);

    return { isLogging };
} 