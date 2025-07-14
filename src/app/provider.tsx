"use client";

import AuthTokenHandler from "@/components/auth/AuthTokenHandler";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { useWebAppListener } from "@/hooks/useWebAppListener";
import { EventName } from "@/hooks/useWebAppListener/types/event.name";
import { useWebAppMethodHandler } from "@/hooks/useWebAppListener/useWebAppMethodHandler";
import { setLS } from "@/tools/localStorage.tool";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BackUrlSetter() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("backUrl");
  const hide = searchParams.get("hide")?.split(",") || [];
  const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
  const MAIN_APP_ORIGIN =
    typeof window !== "undefined" ? window.location.origin : "";

  if (backUrl) {
    setLS("backUrl", backUrl);
  }

  if (MAIN_APP_ORIGIN !== BASE_APP_URL) {
    setLS("formMainApp", true);
  }

  if (searchParams.has("hide")) {
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
  const callAction = useWebAppMethodHandler();
  useWebAppListener((eventName, payload) => {
    console.log("🚀 ~ eventName", eventName);
    switch (eventName) {
      case EventName.acceptCall:
        callAction.acceptCall({
          payload: JSON.parse(JSON.stringify(payload) || "{}"),
        });
        break;

      case EventName.rejectCall:
        callAction.rejectCall({
          payload: JSON.parse(JSON.stringify(payload) || "{}"),
        });
        break;
      default:
        break;
    }
  });
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
