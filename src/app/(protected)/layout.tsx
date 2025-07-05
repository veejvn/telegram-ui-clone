"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { MatrixClientProvider } from "@/contexts/MatrixClientProvider";
import { getLS } from "@/tools/localStorage.tool";
import { TokenExpirationToast } from "@/components/common/Toast";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLogging } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const statusBarHeight = getLS("statusBarHeight");

  const mainStyle = {
    paddingTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };

  useEffect(() => {
    setIsReady(true);
    if (!isLogging) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLogging, router]);

  const pathname = usePathname();
  const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
  const isSettingPage = pathname ? pathname.startsWith("/setting/") : false;
  const shouldShowBottomNav = !isChatDetailPage && !isSettingPage;

  if (!isReady || !isLogging) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <MatrixClientProvider>
      <main>
        <div style={mainStyle} className="flex flex-col min-h-screen">
          {children}
          {shouldShowBottomNav && <BottomNavigattion />}
        </div>
        <TokenExpirationToast />
      </main>
    </MatrixClientProvider>
  );
}
