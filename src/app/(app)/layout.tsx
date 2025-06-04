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
    <main>
      <div className="min-h-screen flex flex-col">
        {children}
        <BottomNavigattion />
      </div>
    </main>
  );
}
