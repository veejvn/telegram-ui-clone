import { create } from "zustand";
import { callService } from "@/services/callService";

interface VoiceCallState {
    isCalling: boolean;
    localStream: MediaStream | null;
    startCall: (
        roomId: string,
        onRemoteStream?: (stream: MediaStream) => void
    ) => Promise<void>;
    endCall: () => void;
}

export const useVoiceCall = create<VoiceCallState>((set, get) => ({
    isCalling: false,
    localStream: null,

    startCall: async (roomId, onRemoteStream) => {
        set({ isCalling: true });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            set({ localStream: stream });

            // Lắng nghe sự kiện remote stream nếu cần
            if (onRemoteStream) {
                callService.once("remote-stream", onRemoteStream);
            }

            await callService.placeCall(roomId, "voice");
        } catch (error) {
            console.error("Lỗi khi gọi thoại:", error);
            set({ isCalling: false, localStream: null });
        }
    },

    endCall: () => {
        callService.hangup();
        set({ isCalling: false });

        // Dừng stream local
        const stream = get().localStream;
        stream?.getTracks().forEach((t) => t.stop());
        set({ localStream: null });
    },
}));
