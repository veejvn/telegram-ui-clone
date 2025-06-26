'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';
import useCallHistoryStore, { CallStatus } from '@/stores/useCallHistoryStore';
import { VoiceCall } from './VoiceCall';
import { VideoCall } from './VideoCall';

interface CallContainerProps {
    roomId: string;
    type: 'voice' | 'video';
    onTerminate: () => void;
}

export default function CallContainer({
    roomId,
    type,
    onTerminate,
}: CallContainerProps) {
    const {
        state,
        incoming,
        placeCall,
        hangup,
        callDuration,
    } = useCallStore();

    const addHistory = useCallHistoryStore((s) => s.addCall);
    const router = useRouter();
    const params = useSearchParams();
    const contactName = params.get('contact') ?? roomId;

    // Tránh add lịch sử 2 lần cho 1 call
    const [historyAdded, setHistoryAdded] = useState(false);

    // Add lịch sử duy nhất khi state là 'ended'
    useEffect(() => {
        if (state === 'ended' && !historyAdded) {
            let status: CallStatus = 'accepted';
            if (incoming && callDuration === 0) status = 'missed';
            else if (!incoming && callDuration === 0) status = 'rejected';

            addHistory({
                calleeId: incoming?.callerId ?? roomId,
                calleeName: contactName,
                type,
                status,
                duration: callDuration,
            });

            setHistoryAdded(true);
            onTerminate();
        }
    }, [state, historyAdded, incoming, callDuration, addHistory, onTerminate, roomId, type, contactName]);

    // Chỉ gọi mới nếu là caller và state là 'idle'
    useEffect(() => {
        if (state === 'idle') {
            placeCall(roomId, type);
        }
    }, [state, roomId, type, placeCall]);

    // Khi unmount component thì cleanup flag này (đề phòng reuse lại)
    useEffect(() => {
        return () => setHistoryAdded(false);
    }, []);

    // Render VoiceCall hoặc VideoCall UI tuỳ loại
    if (type === 'voice') {
        return (
            <VoiceCall
                contactName={contactName}
                callState={state}
                callDuration={callDuration}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
                onSwitchToVideo={() => {
                    hangup();
                    onTerminate();
                    router.replace(
                        `/call/video?calleeId=${encodeURIComponent(roomId)}&contact=${encodeURIComponent(contactName)}`
                    );
                }}
            />
        );
    } else {
        return (
            <VideoCall
                contactName={contactName}
                callState={state}
                callDuration={callDuration}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
            />
        );
    }
}
