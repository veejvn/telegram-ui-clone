"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes";
import { useClientStore } from "@/stores/useMatrixStore";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLogging } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const restoreClient = useClientStore((state) => state.restoreClient);

  useEffect(() => {
    restoreClient();
    setIsReady(true);
    if (!isLogging) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLogging, router, restoreClient]);

  const pathname = usePathname();
  const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
  const isSettingPage = pathname ? pathname.startsWith("/setting/") : false;
  const shouldShowBottomNav = !isChatDetailPage && !isSettingPage;

  // Không render gì cho đến khi component được mounted trên client
  if (!isReady || !isLogging) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main>
      <div className="min-h-screen flex flex-col">
        {children}
        {shouldShowBottomNav && <BottomNavigattion />}
      </div>
    </main>
  );
}
