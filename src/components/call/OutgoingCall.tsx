// src/components/call/OutgoingCall.tsx
'use client';

import React from 'react';
import useCallStore from '@/stores/useCallStore';
import { CallType } from '@/services/callService';

interface OutgoingCallProps {
    roomId: string;
    type: CallType;
    onCancel: () => void;
}

export default function OutgoingCall({ roomId, type, onCancel }: OutgoingCallProps) {
    const { state, hangup } = useCallStore();

    const handleCancel = () => {
        hangup();
        onCancel();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-lg">Đang gọi {type === 'voice' ? 'thoại' : 'video'} đến <strong>{roomId}</strong>…</p>
            {state === 'ringing' && <p className="text-blue-500">Ringing…</p>}
            <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Hủy cuộc gọi
            </button>
        </div>
    );
}
