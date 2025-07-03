"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/contexts/toaster";
import { ToastProvider } from "@/contexts/ToastProvider";
import { setLS } from "@/tools/localStorage.tool";
import { useSearchParams } from "next/navigation";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("backUrl");
  if(backUrl) {
    setLS("backUrl", backUrl);
    console.log("Set backUrl to localStorage:", backUrl);
  }
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider>{children}</ToastProvider>
        <Toaster/>
      </ThemeProvider>
    </>
  );
}
