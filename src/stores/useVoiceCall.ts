import { create } from "zustand";
import { MatrixClient } from "matrix-js-sdk";
import { startCall, endCall } from "@/services/callService";

interface VoiceCallState {
    isCalling: boolean;
    localStream: MediaStream | null;
    startCall: (
        client: MatrixClient,
        calleeId: string,
        onRemoteStream?: (stream: MediaStream) => void
    ) => Promise<void>;
    endCall: () => void;
}

export const useVoiceCall = create<VoiceCallState>((set) => ({
    isCalling: false,
    localStream: null,

    startCall: async (client, calleeId, onRemoteStream) => {
        set({ isCalling: true });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            set({ localStream: stream });

            await startCall(client, calleeId, false, undefined, onRemoteStream);
        } catch (error) {
            console.error("Lỗi khi gọi thoại:", error);
            set({ isCalling: false, localStream: null });
        }
    },

    endCall: () => {
        endCall();
        set({ isCalling: false });

        // Tắt stream
        const current = useVoiceCall.getState().localStream;
        current?.getTracks().forEach((t) => t.stop());
        set({ localStream: null });
    },
}));
