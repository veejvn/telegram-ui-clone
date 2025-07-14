"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { setLS } from "@/tools/localStorage.tool";

export default function GetCookie() {
  const setAuth = useAuthStore.getState().setAuth;
  const logout = useAuthStore.getState().logout;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = async () => {
      try {
        //console.log("🔐 Getting session data from cookies...");

        const res = await fetch("/chat/api/session", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          //console.error("Session API error:", errorData);
          window.location.href = "/chat/login";
          return;
        }

        const { accessToken, userId, deviceId, backUrl, hide } =
          await res.json();

        // ✅ Validation: Kiểm tra đầy đủ thông tin
        if (!accessToken || !userId || !deviceId) {
          // console.error("Missing required auth data:", {
          //   hasToken: !!accessToken,
          //   hasUserId: !!userId,
          //   hasDeviceId: !!deviceId,
          // });
          logout()
          window.location.href = "/chat/login";
          return;
        }

        // ✅ Lưu auth data vào store
        setAuth(accessToken, userId, deviceId);

        // ✅ Lưu UI config vào localStorage
        if (backUrl) {
          setLS("backUrl", backUrl);
          //console.log("🔗 Back URL saved:", barkUrl);
        }

        if (hide) {
          // hide có thể là string hoặc array, xử lý linh hoạt
          const hideArray = typeof hide === "string" ? hide.split(",") : hide;
          setLS("hide", hideArray);
          //console.log("👁️ Hide options saved:", hideArray);
        }

        // ✅ Đánh dấu là từ main app
        const MAIN_APP_ORIGIN =
          typeof window !== "undefined" ? window.location.origin : "";
        const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
        if (MAIN_APP_ORIGIN !== BASE_APP_URL) {
          setLS("fromMainApp", true);
        }

        //console.log("✅ Session data loaded successfully");
      } catch (error) {
        console.error("Failed to get session data:", error);
        setError("Không thể kết nối đến máy chủ");
        // Retry after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    getCookie();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="text-sm text-gray-500">Đang thử kết nối lại...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
