// src/components/call/CallContainer.tsx
'use client';

import { useEffect } from 'react';
import useCallStore from '@/stores/useCallStore';
import useCallHistoryStore, { CallStatus } from '@/stores/useCallHistoryStore';
import OutgoingCall from './OutgoingCall';
import IncomingCall from './IncomingCall';
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
        answerCall,
        hangup,
        callDuration,
    } = useCallStore();

    const addHistory = useCallHistoryStore((s) => s.addCall);

    // Khi mount lần đầu, nếu là caller thì placeCall
    useEffect(() => {
        if (state === 'idle') {
            placeCall(roomId, type);
        }
    }, [state, roomId, type, placeCall]);

    // Khi call vừa kết thúc, lưu lịch sử rồi exit
    useEffect(() => {
        if (state === 'ended') {
            let status: CallStatus = 'accepted';

            // nếu là incoming mà không accept (duration=0) → missed
            if (incoming && callDuration === 0) {
                status = 'missed';
            }
            // nếu là caller huỷ ngay (duration=0) → rejected
            else if (!incoming && callDuration === 0) {
                status = 'rejected';
            }

            addHistory({
                calleeId: incoming?.callerId ?? roomId,
                type,
                status,
                duration: callDuration,
            });

            onTerminate();
        }
    }, [state]);

    // Outgoing (caller đang ringing)
    if (state === 'ringing') {
        return (
            <OutgoingCall
                roomId={roomId}
                type={type}
                onCancel={onTerminate}
            />
        );
    }

    // Incoming (callee thấy màn hình đổ chuông)
    if (state === 'incoming' && incoming) {
        return (
            <IncomingCall
                callerName={incoming.callerId}
                onAccept={() => answerCall()}
                onReject={() => {
                    hangup();
                    onTerminate();
                }}
            />
        );
    }

    // Connecting/Connected → show VoiceCall hoặc VideoCall
    if (state === 'connecting' || state === 'connected') {
        const contactName = incoming?.callerId ?? roomId;
        return type === 'voice' ? (
            <VoiceCall
                contactName={contactName}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
                onSwitchToVideo={() => {
                    // chuyển sang video
                    hangup();
                    onTerminate();
                    // bạn có thể đưa router.push(...) vào onTerminate callback để điều hướng
                }}
            />
        ) : (
            <VideoCall
                contactName={contactName}
                onEndCall={() => {
                    hangup();
                    onTerminate();
                }}
            />
        );
    }

    // Các state khác (idle, error, ended) → render null
    return null;
}
