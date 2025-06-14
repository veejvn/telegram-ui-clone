// src/app/(app)/setting/recent-calls/page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneCall, ChevronLeft } from 'lucide-react';

interface CallRecord {
    id: number;
    name: string;
    time: string;
    incoming: boolean;
}

const dummyCalls: CallRecord[] = [
    { id: 1, name: 'Alice', time: '10:24 AM', incoming: true },
    { id: 2, name: 'Bob', time: 'Yesterday, 6:45 PM', incoming: false },
    { id: 3, name: 'Charlie', time: 'Jun 1, 3:12 PM', incoming: true },
];

export default function RecentCallsPage() {
    const router = useRouter();

    return (
        <div className="p-4 space-y-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-sm"
            >
                <ChevronLeft className="h-5 w-5" />
                <span>Settings</span>
            </button>

            <h1 className="text-2xl font-semibold">Recent Calls</h1>
            {dummyCalls.map(call => (
                <Card key={call.id} className="py-2 rounded-2xl">
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500 h-9 w-9 rounded-full flex items-center justify-center text-white">
                                <PhoneCall className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-medium">{call.name}</div>
                                <div className="text-sm">{call.time}</div>
                            </div>
                        </div>
                        <span className="text-sm">
                            {call.incoming ? 'Incoming' : 'Outgoing'}
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
