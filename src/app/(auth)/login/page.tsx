"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import LoginForm from "@/components/auth/LoginForm";
import { ModeToggle } from "@/components/common/ModeToggle";
import { ROUTES } from "@/constants/routes";
import { callService } from "@/services/callService";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const { accessToken, userId, deviceId } = useAuthStore();

  useEffect(() => {
    if (accessToken && userId && deviceId) {
      callService.reinitialize("");
    }
  }, [accessToken, userId, deviceId]);

  // Callback khi login thành công
  const handleSuccess = (token: string, userId: string, deviceId: string) => {
    login(token, userId, deviceId);
    // Đã chuyển reinitialize sang useEffect
    //console.log("🚀 Login successful, redirecting to chat...");

    // Small delay để ensure store update
    setTimeout(() => {
      router.push(ROUTES.CHAT);
    }, 100);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative w-full max-w-md px-4 py-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/chat/images/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl"
            loading="eager"
            priority
          />
        </div>
        <LoginForm onSuccess={handleSuccess} />
      </div>
      <div className="absolute bottom-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}
