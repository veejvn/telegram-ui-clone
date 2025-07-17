import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/provider";
import CallOverlay from "@/components/call/CallOverlay"; // Thêm dòng này
import { Toaster } from "sonner";
import NoZoom from "@/components/common/NoZoom";

const inter = Inter({
  subsets: ["vietnamese"],
});

export const metadata: Metadata = {
  title: "Telegram UI",
  description: "A simple Telegram UI clone built with Next.js and Tailwind CSS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Thêm các thuộc tính khác nếu muốn
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={`${inter.className} antialiased select-none`}>
        {/* <NoZoom /> */}
        <Providers>
          <CallOverlay /> {/*  Luôn lắng nghe sự kiện call */}
          <Toaster richColors position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
