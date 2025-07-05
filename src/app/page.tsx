"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookie";
import { ROUTES } from "@/constants/routes";

export default function Home() {
  const isLogging = useAuthStore((state) => state.isLogging);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Xử lý loginToken từ query param
      const url = new URL(window.location.href);
      const loginToken = url.searchParams.get('loginToken');
      if (loginToken) {
        fetch("https://matrix.teknix.dev/_matrix/client/r0/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "m.login.token",
            token: loginToken
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.access_token && data.user_id && data.device_id) {
              setCookie("matrix_token", data.access_token, 7);
              setCookie("matrix_user_id", data.user_id, 7);
              setCookie("matrix_device_id", data.device_id, 7);
              window.location.href = ROUTES.CHAT;
              return;
            } else {
              router.replace(ROUTES.LOGIN);
            }
          });
        return;
      }
      // Xử lý access_token từ URL fragment (nếu có)
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const userId = params.get('user_id');
        const deviceId = params.get('device_id');
        if (accessToken && userId && deviceId) {
          setCookie("matrix_token", accessToken, 7);
          setCookie("matrix_user_id", userId, 7);
          setCookie("matrix_device_id", deviceId, 7);
          window.location.hash = '';
          window.location.href = ROUTES.CHAT;
          return;
        }
      }
      // Nếu không có token, kiểm tra cookie
      const token = getCookie("matrix_token");
      if (!token) {
        router.replace(ROUTES.LOGIN);
      } else {
        router.replace(ROUTES.CHAT);
      }
    }
  }, [router]);

  return null;
}
