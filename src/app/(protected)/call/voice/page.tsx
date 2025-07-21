// src/app/(protected)/call/voice/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CallContainer from '@/components/call/CallContainer';

export default function VoiceCallPage() {
    const router = useRouter();
    const params = useSearchParams();
    const calleeId = params.get('calleeId');
    const contact = params.get('contact') || 'Unknown';

    if (!calleeId) {
        return <p className="p-4 text-red-500">Thiếu thông tin cuộc gọi (calleeId)</p>;
    }

    const handleTerminate = () => {
        router.replace(`/chat/${encodeURIComponent(calleeId)}`);
    };

    return (
        <CallContainer
            roomId={calleeId}    // DÙNG calleeId làm roomId
            type="voice"
            onTerminate={handleTerminate}
        />
    );
}
