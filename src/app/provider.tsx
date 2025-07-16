"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { useWebAppListener } from "@/hooks/useWebAppListener";
import { EventName } from "@/hooks/useWebAppListener/types/event.name";
import { useWebAppMethodHandler } from "@/hooks/useWebAppListener/useWebAppMethodHandler";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const callAction = useWebAppMethodHandler();
  useWebAppListener((eventName, payload) => {
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
        <ToastProvider>{children}</ToastProvider>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
