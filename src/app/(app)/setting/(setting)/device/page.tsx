// src/app/(app)/setting/device/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, ChevronLeft } from 'lucide-react';

export default function DevicesPage() {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const router = useRouter();

    const handleScan = () => {
        // TODO: thay bằng logic scan thật
        setScannedData('DeviceID-12345');
    };

    return (
        <div className="p-4 bg-black min-h-screen text-white space-y-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-sm text-gray-400"
            >
                <ChevronLeft className="h-5 w-5" />
                <span>Settings</span>
            </button>

            <h1 className="text-2xl font-semibold">Devices</h1>
            <Card className="bg-zinc-900 rounded-2xl">
                <CardContent className="flex flex-col items-center p-6">
                    <div className="bg-orange-500 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                        <QrCode className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="mt-4 text-center text-gray-300">Link Telegram Desktop or Telegram Web by scanning QR code.</h2>

                    <button
                        onClick={handleScan}
                        className="px-6 py-2 bg-orange-500 rounded-2xl font-medium mt-4"
                    >
                        Link Desktop Device
                    </button>
                    {scannedData && (
                        <p className="mt-4 text-center text-gray-300">
                            Scanned: <span className="font-mono">{scannedData}</span>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
