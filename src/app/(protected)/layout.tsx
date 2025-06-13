"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes";
import * as sdk from "matrix-js-sdk";
import { getLS } from "@/tools/localStorage.tool";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);
export const useMatrixClient = () => useContext(MatrixClientContext);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLogging } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);

  useEffect(() => {
    setIsReady(true);
    if (!isLogging) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLogging, router]);

  useEffect(() => {
    const accessToken = getLS("access_token");
    const userId = getLS("user_id");
    if (!accessToken || !userId) return;
    const matrixClient = sdk.createClient({
      baseUrl: "https://matrix.org",
      accessToken,
      userId,
    });
    matrixClient.startClient();
    setClient(matrixClient);
  }, [isLogging]);

  const pathname = usePathname();
  const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
  const isSettingPage = pathname ? pathname.startsWith("/setting/") : false;
  const shouldShowBottomNav = !isChatDetailPage && !isSettingPage;

  if (!isReady || !isLogging || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <MatrixClientContext.Provider value={client}>
      <main>
        <div className="min-h-screen flex flex-col">
          {children}
          {shouldShowBottomNav && <BottomNavigattion />}
        </div>
      </main>
    </MatrixClientContext.Provider>
  );
}
