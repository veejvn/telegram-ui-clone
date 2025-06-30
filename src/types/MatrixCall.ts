// src/types/MatrixCall.ts
export interface MatrixCall {
    callId: string;
    roomId: string;
    type: "video" | "voice";
    state: string;

    answer: (
        constraintsOrAudio?: boolean | { audio: boolean; video: boolean }
    ) => void;

    hangup: (reason: string, suppressEvent: boolean) => void;

    getOpponentMember: () => { userId: string } | null;

    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;

    isLocalOnHold?: () => boolean;
    isRemoteOnHold?: () => boolean;
    setRemoteOnHold?: (hold: boolean) => void;
    setLocalOnHold?: (hold: boolean) => void;
}
