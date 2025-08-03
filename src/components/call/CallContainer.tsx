import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCallStore from '@/stores/useCallStore';
import useCallHistoryStore, { CallStatus } from '@/stores/useCallHistoryStore';
import { useMatrixClient } from '@/contexts/MatrixClientProvider';

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
        callEndedReason,
        upgradeToVideo,   // <-- Lấy luôn từ store
    } = useCallStore();
    const [currentType, setCurrentType] = useState<'voice' | 'video'>(type);

    const addHistory = useCallHistoryStore((s) => s.addCall);
    const router = useRouter();
    const client = useMatrixClient();                    // ← import Matrix client

    const params = useSearchParams();
    const contactName = params.get('contact') ?? roomId;
    // 1) State và effect để tính avatarUrl
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    useEffect(() => {
        if (!client || !roomId) return;
        const room = client.getRoom(roomId);
        if (!room) return;
        // Nếu 1‑1 chat, lấy member khác
        const other = room.getMembers().find(m => m.userId !== client.getUserId());
        const url =
            other?.getAvatarUrl(
                process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
                128, 128,
                'crop',
                false,
                true,   // allowDirectServerLookup
                false   // allowCached
            ) ?? '';
        setAvatarUrl(url);
    }, [client, roomId]);
    // Tránh add lịch sử 2 lần cho 1 call
    const [historyAdded, setHistoryAdded] = useState(false);

    // Add lịch sử duy nhất khi state là 'ended'
    useEffect(() => {
        if (state === 'ended' && !historyAdded) {
            let status: CallStatus = 'accepted';

            // Mapping reason chuẩn
            if (callEndedReason === "user_declined") status = 'rejected';
            else if (
                callEndedReason === "invite_timeout" ||
                callEndedReason === "invite_expired"
            ) status = 'missed';
            else if (callDuration === 0) status = 'missed'; // fallback nếu không có reason

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
    }, [
        state,
        historyAdded,
        incoming,
        callDuration,
        addHistory,
        onTerminate,
        roomId,
        type,
        contactName,
        callEndedReason,
    ]);

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

    // Sửa chỗ này: KHÔNG gọi hangup trước khi switch video!
    if (type === 'voice') {
        return (
            <VoiceCall
                contactName={contactName}
                contactAvatar={avatarUrl}        // ← truyền avatarUrl vào đây
                callState={state}
                callDuration={callDuration}
                onUpgrade={() => {
                    upgradeToVideo();
                    setCurrentType('video');
                }}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
            />
        );
    } else {
        return (
            <VideoCall
                contactName={contactName}
                callState={state}
                contactAvatar={avatarUrl}        // ← truyền avatarUrl vào đây
                callDuration={callDuration}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
            />
        );
    }
}
