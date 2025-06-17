import { create } from "zustand";
import { MatrixClient } from "matrix-js-sdk";
import { startCall, endCall } from "@/services/callService";
import { useCallHistoryStore } from "@/stores/useCallHistoryStore";

interface VideoCallState {
    isCalling: boolean;
    startCall: (client: MatrixClient, calleeId: string) => Promise<void>;
    endCall: () => void;
}

export const useVideoCall = create<VideoCallState>((set) => ({
    isCalling: false,

    startCall: async (client, calleeId) => {
        set({ isCalling: true });
        try {
            await startCall(client, calleeId, true); //  gọi video
            // Có thể lưu lịch sử tại đây nếu cần
        } catch (error) {
            console.error("Lỗi khi gọi video:", error);
            set({ isCalling: false });
        }
    },

    endCall: () => {
        endCall();
        set({ isCalling: false });
    },
}));
