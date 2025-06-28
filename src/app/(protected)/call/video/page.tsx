// src/app/(protected)/call/video/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CallContainer from '@/components/call/CallContainer';

export default function VideoCallPage() {
    const router = useRouter();
    const params = useSearchParams();
    const calleeId = params.get('calleeId');
    const contact = params.get('contact') || 'Unknown';

    if (!calleeId) {
        return <p className="p-4 text-red-500">Thiếu thông tin cuộc gọi (calleeId)</p>;
    }

    const handleTerminate = () => {
        router.replace('/call');
    };

    return (
        <CallContainer
            roomId={calleeId}
            type="video"
            onTerminate={handleTerminate}
        />
    );
}
