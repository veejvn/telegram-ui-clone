"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookie";
import { ROUTES } from "@/constants/routes";
import { normalizeMatrixUserId, isValidMatrixUserId } from "@/utils/matrixHelpers";
import { clearMatrixAuthCookies } from "@/utils/clearAuthCookies";
import { callService } from "@/services/callService";

export default function Home() {
  const { isLogging, login } = useAuthStore();
  const router = useRouter();
  const MATRIX_BASE_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL || "https://matrix.teknix.dev";

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Kiểm tra có login token hoặc access token trong URL không
        const urlParams = new URLSearchParams(window.location.search);
        const loginToken = urlParams.get("loginToken");
        const hash = window.location.hash;
        const hasAccessTokenInHash = hash.includes("access_token");

        // ✅ ƯU TIÊN XỬ LÝ SSO LOGIN TOKEN TRƯỚC
        if (loginToken) {
          try {
            const response = await fetch(`${MATRIX_BASE_URL}/_matrix/client/r0/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "m.login.token",
                token: loginToken
              })
            });
            
            const data = await response.json();
            
            if (response.ok && data.access_token && data.user_id && data.device_id) {
              // Clear any existing auth first
              clearMatrixAuthCookies();
              
              // Set new credentials
              setCookie("matrix_token", data.access_token, 7);
              setCookie("matrix_user_id", data.user_id, 7);
              setCookie("matrix_device_id", data.device_id, 7);

              // ✅ Update useAuthStore với credentials mới
              login(data.access_token, data.user_id, data.device_id);

              // ✅ Reinitialize callService với credentials mới
              callService.reinitialize();

              // Clean URL and redirect
              window.history.replaceState({}, '', '/');
              router.replace("/chat");
              return;
            } else {
              router.push(ROUTES.LOGIN);
              return;
            }
          } catch (error) {
            router.push(ROUTES.LOGIN);
            return;
          }
        }

        // Check for access token in URL fragment
        if (hasAccessTokenInHash) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const userId = params.get("user_id");
          const deviceId = params.get("device_id");

          if (accessToken && userId) {
            // Clear any existing auth first
            clearMatrixAuthCookies();
            
            setCookie("matrix_token", accessToken, 7);
            setCookie("matrix_user_id", userId, 7);
            if (deviceId) setCookie("matrix_device_id", deviceId, 7);

            // ✅ Update useAuthStore với credentials mới
            login(accessToken, userId, deviceId || "");

            // ✅ Reinitialize callService với credentials mới
            callService.reinitialize();

            // Clean URL and redirect
            window.history.replaceState({}, '', '/');
            router.replace("/chat");
            return;
          }
        }

        // ✅ CHỈ CHECK EXISTING TOKEN NẾU KHÔNG CÓ SSO TOKEN
        const existingToken = getCookie("matrix_token");
        const existingUserId = getCookie("matrix_user_id");
        
        // ✅ THÊM CHECK ĐỂ TRÁNH RACE CONDITION SAU LOGOUT
        // Nếu không có cả token và user ID thì chắc chắn đã logout
        if (!existingToken || !existingUserId) {
          router.push(ROUTES.LOGIN);
          return;
        }
        
        // Chỉ check session validity nếu có đủ thông tin
        try {
          const whoAmIResponse = await fetch(`${MATRIX_BASE_URL}/_matrix/client/v3/account/whoami`, {
            headers: {
              'Authorization': `Bearer ${existingToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (whoAmIResponse.ok) {
            // ✅ Đảm bảo callService có client nếu session hợp lệ
            callService.reinitialize();
            router.push("/chat");
            return;
          } else {
            clearMatrixAuthCookies();
            router.push(ROUTES.LOGIN);
            return;
          }
        } catch (error) {
          clearMatrixAuthCookies();
          router.push(ROUTES.LOGIN);
          return;
        }
        
      } catch (error) {
        router.push(ROUTES.LOGIN);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse">Đang kiểm tra xác thực...</div>
      </div>
    </div>
  );
}
