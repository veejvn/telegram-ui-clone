'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';
import IncomingCall from './IncomingCall';

export default function IncomingCallHandler() {
    const router = useRouter();
    const { state, incoming, answerCall, hangup } = useCallStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Phát âm thanh khi có cuộc gọi đến
    useEffect(() => {
        if (state === 'incoming') {
            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/ringtone.mp3');
                audioRef.current.loop = true;
                audioRef.current.play().catch((err) => {
                    console.warn('Không thể phát âm thanh:', err);
                });
            } else {
                audioRef.current.play().catch(() => { });
            }
        }

        // Khi kết thúc hoặc từ chối cuộc gọi, dừng nhạc
        if (state === 'connected' || state === 'ended' || state === 'idle' || state === 'error') {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        }

        // cleanup nếu component unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [state]);

    // Khi kết nối thành công, điều hướng sang giao diện gọi
    useEffect(() => {
        if (state === 'connected' && incoming) {
            router.push(
                `/call/${incoming.callType}?calleeId=${incoming.roomId}&contact=${encodeURIComponent(incoming.callerId)}`
            );
        }
    }, [state, incoming, router]);

    if (state !== 'incoming' || !incoming) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 text-white">
            <IncomingCall
                callerName={incoming.callerId}
                onAccept={answerCall}
                onReject={hangup}
            />
        </div>
    );
}
