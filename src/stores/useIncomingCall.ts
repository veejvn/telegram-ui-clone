import { useEffect, useState } from "react";
import { useClientStore } from "@/stores/useMatrixStore";
import type { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
import { CallErrorCode } from "matrix-js-sdk/src/webrtc/call";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    useEffect(() => {
        if (!client) return;

        const handleIncomingCall = (incomingCall: MatrixCall) => {
            console.log("📞 Cuộc gọi đến:", incomingCall);

            // Nếu đang có call khác thì từ chối
            if (call && call.callId !== incomingCall.callId) {
                incomingCall.hangup(CallErrorCode.UserBusy, true);
                return;
            }

            setCall(incomingCall);
            const opponent = incomingCall.getOpponentMember();
            setCallerId(opponent?.userId || "Unknown");
            setVisible(true);
        };

        (client as any).on("Call.incoming", handleIncomingCall);

        return () => {
            (client as any).removeListener("Call.incoming", handleIncomingCall);
        };
    }, [client, call]);

    const acceptCall = () => {
        if (!call) return;

        const isVideo = call.type === "video";
        call.answer(true, isVideo);
        setVisible(false);

        // 👉 Tự động redirect sau khi nhận
        const calleeId = call.getOpponentMember()?.userId;
        if (calleeId) {
            const page = isVideo ? "video" : "voice";
            router.replace(`/call/${page}?calleeId=${encodeURIComponent(calleeId)}&contact=${calleeId.split(":")[0].replace("@", "")}`);
        }
    };

    const rejectCall = () => {
        if (!call) return;

        call.hangup(CallErrorCode.UserHangup, true);
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
