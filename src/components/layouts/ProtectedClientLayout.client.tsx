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

  useEffect(() => {
    setIsReady(true);
    if (!isLogging) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLogging, router]);

  if (!isReady || !isLogging) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <MatrixClientProvider>
        <IncomingCallHandler />
        <main className="min-h-screen flex flex-col">
          {children}
          <BottomNavigationWrapper/>
        </main>
      </MatrixClientProvider>
    </Suspense>
  );
}
