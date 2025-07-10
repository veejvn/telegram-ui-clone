"use client";

import AuthTokenHandler from "@/components/auth/AuthTokenHandler";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { setLS } from "@/tools/localStorage.tool";
import { getCookie } from "@/utils/cookie";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BackUrlSetter() {
  const searchParams = useSearchParams();
  const backUrl = getCookie("backUrl");
  const hide = getCookie("hide")?.split(",") || [];
  const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
  const MAIN_APP_ORIGIN =
    typeof window !== "undefined" ? window.location.origin : "";

  if (backUrl) {
    setLS("backUrl", backUrl);
  }

  if (MAIN_APP_ORIGIN !== BASE_APP_URL) {
    setLS("formMainApp", true);
  }

  if (hide) {
    // if (hide === null)
    //   setLS("hide", []);
    // else
    setLS("hide", hide);
  }
  return null;
}

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Suspense fallback={null}>
          <BackUrlSetter />
        </Suspense>
        {/* <AuthTokenHandler /> */}
        <ToastProvider>{children}</ToastProvider>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
