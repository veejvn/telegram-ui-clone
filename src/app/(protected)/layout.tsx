// src/app/(protected)/layout.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

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

  return <>{children}</>;
}
