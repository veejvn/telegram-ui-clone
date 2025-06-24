"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLogging = useAuthStore((state) => state.isLogging);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    if (isLogging) {
      router.replace(ROUTES.CHAT);
    }
  }, [isLogging, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLogging) {
    return null;
  }

  return <>{children}</>;
}
