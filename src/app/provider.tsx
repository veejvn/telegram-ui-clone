"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { useWebAppListener } from "@/hooks/useWebAppListener";
import { EventName } from "@/hooks/useWebAppListener/types/event.name";
import { useWebAppMethodHandler } from "@/hooks/useWebAppListener/useWebAppMethodHandler";
import { callService } from "@/services/callService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
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
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // callService.reinitialize("!GjGBadHVuqZYqWQxvZ:matrix.teknix.dev");
    callService.reinitialize("");
  }, [accessToken]);

  useEffect(() => {
    const handleAutoAcceptAndNavigate = (data: any) => {
      console.log("[UI] Auto accept and navigate:", data);
      router.replace(data.navigationUrl);
    };
    callService.on("auto-accept-and-navigate", handleAutoAcceptAndNavigate);
  }, []);

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider>{children}</ToastProvider>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
