"use client";
import React, { useEffect, useState} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { MatrixClientProvider } from "@/contexts/MatrixClientProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLogging } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

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
        <div className="min-h-screen flex flex-col">
          {children}
          {shouldShowBottomNav && <BottomNavigattion />}
        </div>
      </main>
    </MatrixClientProvider>
  );
}
