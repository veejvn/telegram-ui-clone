// src/app/(protected)/ProtectedClientLayout.client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/useAuthStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BottomNavigation from '@/components/layouts/BottomNavigation';
import IncomingCallHandler from "@/components/call/IncomingCallHandler";

// Dynamic import client-only MatrixClientProvider
const MatrixClientProvider = dynamic(
    () =>
        import('@/contexts/MatrixClientProvider').then(
            (mod) => mod.MatrixClientProvider
        ),
    { ssr: false }
);

export default function ProtectedClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isLogging } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
        if (!isLogging) {
            router.replace(ROUTES.LOGIN);
        }
    }, [isLogging, router]);

    const pathname = usePathname();
    const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
    const isSettingPage = pathname ? pathname.startsWith('/setting/') : false;
    const isCallPage = pathname ? pathname.startsWith("/call/") : false;
    const shouldShowBottomNav = !isChatDetailPage && !isSettingPage && !isCallPage;

    if (!isReady || !isLogging) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <MatrixClientProvider>
            <IncomingCallHandler />
            <main className="min-h-screen flex flex-col">
                {children}
                {shouldShowBottomNav && <BottomNavigation />}
            </main>
        </MatrixClientProvider>
    );
}
