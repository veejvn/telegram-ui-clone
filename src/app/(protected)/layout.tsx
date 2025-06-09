// src/app/(protected)/layout.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { usePathname } from "next/navigation";
import { useAuthProtection } from "@/hooks/useAuthProtection";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLogging } = useAuthStore();

  useEffect(() => {
    if (!isLogging) {
      router.replace('/login');
    }
  }, [isLogging, router]);

  // Trong khi chưa biết state (ví dụ hydration), bạn có thể hiển thị loading
  if (!isLogging) {
    return null; // hoặc <LoadingSpinner/>
  }
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
