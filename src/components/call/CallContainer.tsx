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
        callEndedReason,
        upgradeToVideo,   // <-- Lấy luôn từ store
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
                callState={state}
                callDuration={callDuration}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
                onSwitchToVideo={async () => {
                    // Chỉ gọi upgradeToVideo, không hangup/reset!
                    await upgradeToVideo();
                    // Chuyển sang layout video call
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
