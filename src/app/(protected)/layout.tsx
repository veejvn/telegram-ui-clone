"use client";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isChatDetailPage = /^\/chat(\/.+)+$/.test(pathname);
  const isSettingPage = pathname.startsWith("/setting/");
  const shouldShowBottomNav = !isChatDetailPage && !isSettingPage;

  return (
    <main>
      <div className="min-h-screen flex flex-col">
        {children}
        {shouldShowBottomNav && <BottomNavigattion />}
      </div>
    </main>
  );
}
