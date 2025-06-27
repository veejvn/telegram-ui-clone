import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/provider";
<<<<<<< HEAD
import CallOverlay from "@/components/call/CallOverlay"; // Thêm dòng này
=======
import { Toaster } from "sonner";
>>>>>>> 63ff68dd67bfe39f4b7a7c4bfe8ad19fa282377a

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
      <body className={`${inter.className} antialiased`}>
        <Providers>
<<<<<<< HEAD
          <CallOverlay />  {/*  Luôn lắng nghe sự kiện call */}
=======
          <Toaster richColors position="top-center" />
>>>>>>> 63ff68dd67bfe39f4b7a7c4bfe8ad19fa282377a
          {children}
        </Providers>
      </body>
    </html>
  );
}
