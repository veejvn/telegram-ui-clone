import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <NoZoom/>
        <Providers>
          <CallOverlay />  {/*  Luôn lắng nghe sự kiện call */}
          <Toaster richColors position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
