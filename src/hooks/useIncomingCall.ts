import { useEffect, useState } from 'react';
import { useClientStore } from '@/stores/useMatrixStore';
import type { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { CallErrorCode } from 'matrix-js-sdk/src/webrtc/call';

interface IncomingCallState {
    call: MatrixCall | null;
    callerId: string | null;
    visible: boolean;
    acceptCall: () => void;
    rejectCall: () => void;
}

export function useIncomingCall(): IncomingCallState {
    const { client } = useClientStore();
    const [call, setCall] = useState<MatrixCall | null>(null);
    const [callerId, setCallerId] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!client) return;

        const handleIncomingCall = (incomingCall: MatrixCall) => {
            console.log('📞 Cuộc gọi đến:', incomingCall);

            if (call && call.callId !== incomingCall.callId) {
                incomingCall.hangup(CallErrorCode.UserBusy, true);
                return;
            }

            setCall(incomingCall);
            const opponent = incomingCall.getOpponentMember();
            setCallerId(opponent?.userId || 'Unknown');
            setVisible(true);
        };

        // ✅ ép kiểu sự kiện để tránh lỗi TS
        (client as any).on('Call.incoming', handleIncomingCall);

        return () => {
            (client as any).removeListener('Call.incoming', handleIncomingCall);
        };
    }, [client, call]);

    const acceptCall = () => {
        if (!call) return;

        const isVideo = call.type === 'video';
        call.answer(true, isVideo); // ✅ đúng kiểu
        setVisible(false);
    };

    const rejectCall = () => {
        if (!call) return;

        call.hangup(CallErrorCode.UserHangup, true); // ✅ enum chuẩn
        setCall(null);
        setCallerId(null);
        setVisible(false);
    };

    return {
        call,
        callerId,
        visible,
        acceptCall,
        rejectCall,
    };
}
