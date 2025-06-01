"use client";
import BottomNavigattion from "@/app/components/BottomNavigation";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isChatDetailPage = /^\/chat(\/.+)+$/.test(pathname);
  const shouldShowBottomNav = !isChatDetailPage;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {children}
      {shouldShowBottomNav && (
        <div className="sticky bottom-0 z-50">
          <BottomNavigattion />
        </div>
      )}
    </main>
  );
}
