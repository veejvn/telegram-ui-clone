"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { setLS } from "@/tools/localStorage.tool";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BackUrlSetter() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("backUrl");
  const hide = searchParams.get("hide")?.split(",") || [];
  const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
  const MAIN_APP_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

  if (backUrl) {
    setLS("backUrl", backUrl);
  }

  if (MAIN_APP_ORIGIN !== BASE_APP_URL) {
    setLS("formMainApp", true);
  }

  if(searchParams.has("hide")){
    setLS("hide", hide);
  }else{
    setLS("hide", [])
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
        <ToastProvider>{children}</ToastProvider>
        <Toaster/>
      </ThemeProvider>
    </>
  );
}
