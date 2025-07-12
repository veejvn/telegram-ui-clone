// src/app/(protected)/ProtectedClientLayout.client.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import IncomingCallHandler from "@/components/call/IncomingCallHandler";
import BottomNavigationWrapper from "@/components/layouts/BottomNavigationWrapper";
import useRegisterPushKey from "@/hooks/useRegisterPushKey ";
import { TokenExpirationToast } from "@/components/common/Toast";
import GetCookie from "@/components/auth/GetCookie";
import { ToastProvider } from "@/contexts/ToastProvider";

// Dynamic import client-only MatrixClientProvider
const MatrixClientProvider = dynamic(
  () =>
    import("@/contexts/MatrixClientProvider").then(
      (mod) => mod.MatrixClientProvider
    ),
  { ssr: false }
);

export default function ProtectedClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLogging = useAuthStore((state) => state.isLogging);
  const [isReady, setIsReady] = useState(false);

  const [checked, setChecked] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  //console.log("accessToken", accessToken);

  // Luôn gọi hook này, không phụ thuộc vào điều kiện

  useEffect(() => {
    // Khi accessToken thay đổi, đánh dấu đã kiểm tra xong
    if (accessToken) setChecked(true);
  }, [accessToken]);

  return (
    <Suspense fallback={null}>
      {!checked ? (
        <GetCookie />
      ) : (
      <MatrixClientProvider>
        <IncomingCallHandler />
        <main className="min-h-screen flex flex-col">
          {children}
          <BottomNavigationWrapper />
        </main>
        <TokenExpirationToast />
      </MatrixClientProvider>
      )}
    </Suspense>
  );
}
