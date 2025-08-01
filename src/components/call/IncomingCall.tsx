// components/IncomingCall.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Video, X } from 'lucide-react';

export interface IncomingCallProps {
    callerName: string;
    onAccept: () => void | Promise<void>;
    onReject: () => void;
    callType?: 'voice' | 'video';
    callerAvatarUrl?: string;
}

export default function IncomingCall({
    callerName,
    onAccept,
    onReject,
    callType = 'voice',
    callerAvatarUrl,
}: IncomingCallProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;

    // --- 1) Tính dynamicBgStyle ---
    const dynamicBgStyle: React.CSSProperties = callerAvatarUrl
        ? {
            backgroundImage: `
          linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.5)),
          url(${callerAvatarUrl})
        `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : {
            background: 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)',
        };

    const overlay = (
        <div
            className="fixed inset-0 z-[9999] flex flex-col justify-between items-center"
            style={{
                ...dynamicBgStyle,
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >

            {/* Phần header: tên và type */}
            <div className="relative z-10 mt-8 flex flex-col items-center space-y-1">
                <span className="text-white/80 text-sm uppercase">
                    {callType === 'video' ? 'Video Calling' : 'Calling'}
                </span>
                <span className="text-white text-2xl font-semibold truncate">
                    {callerName}
                </span>
            </div>

            {/* Nút từ chối và chấp nhận */}
            <div className="relative z-10 mb-12 flex items-center space-x-20">
                <button
                    onClick={onReject}
                    aria-label="Reject call"
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg active:scale-95 transition"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <X size={24} color="white" />
                </button>

                <button
                    onClick={onAccept}
                    aria-label="Accept call"
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg active:scale-95 transition"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {callType === 'video' ? (
                        <Video size={24} color="white" />
                    ) : (
                        <Phone size={24} color="white" className="rotate-[135deg]" />
                    )}
                </button>
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
}
