"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ToastProvider } from "@/contexts/ToastProvider";

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
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </>
  );
}
