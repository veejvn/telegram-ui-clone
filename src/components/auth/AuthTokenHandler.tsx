"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookie";
import { ROUTES } from "@/constants/routes";
import { clearMatrixAuthCookies } from "@/utils/clearAuthCookies";
import { callService } from "@/services/callService";
import { getLS } from "@/tools/localStorage.tool";

export default function AuthTokenHandler() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const MATRIX_BASE_URL =
    process.env.NEXT_PUBLIC_MATRIX_BASE_URL || "https://matrix.teknix.dev";
  const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
  const MAIN_APP_ORIGIN =
    typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const handleAuth = async () => {
        const ssoToken = getCookie("sso_token");
        if (ssoToken) {
            try {
            const response = await fetch(
                `${MATRIX_BASE_URL}/_matrix/client/r0/login`,
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "m.login.token",
                    token: ssoToken,
                }),
                }
            );
            const data = await response.json();
            if (
                response.ok &&
                data.access_token &&
                data.user_id &&
                data.device_id
            ) {
                //console.log(data.user_id)
                setCookie("matrix_token", data.access_token, 7);
                setCookie("matrix_user_id", data.user_id, 7);
                setCookie("matrix_device_id", data.device_id, 7);

                // ✅ Update useAuthStore với credentials mới
                login(data.access_token, data.user_id, data.device_id);

                // ✅ Reinitialize callService với credentials mới
                //callService.reinitialize();

                // Chuyển hướng sang trang chat (nếu chưa ở đó)
                if (window.location.pathname !== ROUTES.CHAT) {
                    router.replace(ROUTES.CHAT);
                  }
                return;
            } else {
                clearMatrixAuthCookies();
                window.location.href = BASE_APP_URL || "/login";
            }
            } catch (error) {
                console.log(error);
                clearMatrixAuthCookies();
                window.location.href = BASE_APP_URL || "/login";
            }
        }else{
            window.location.href = BASE_APP_URL || "/login";
        }
    };
    handleAuth();
  }, [router, login, BASE_APP_URL]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse">Đang kiểm tra xác thực...</div>
      </div>
    </div>
  );
}
