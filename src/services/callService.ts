import sdk, { MatrixClient, Room } from "matrix-js-sdk";
import {
    MatrixCall,
    CallEvent,
    CallErrorCode,
} from "matrix-js-sdk/lib/webrtc/call";

let currentCall: MatrixCall | null = null;

export const createOrGetRoom = async (
    client: MatrixClient,
    calleeId: string
): Promise<string> => {
    const rooms = client.getRooms();
    const existingRoom = rooms.find((room: Room) =>
        room.getJoinedMembers().some((member) => member.userId === calleeId)
    );

    if (existingRoom) return existingRoom.roomId;

    const room = await client.createRoom({
        invite: [calleeId],
        is_direct: true,
    });

    return room.room_id;
};

export const startCall = async (
    client: MatrixClient,
    calleeId: string,
    isVideo = false,
    onCallEstablished?: (call: MatrixCall) => void,
    onRemoteStream?: (stream: MediaStream) => void
) => {
    const roomId = await createOrGetRoom(client, calleeId);
    const call = sdk.createNewMatrixCall(client, roomId);
    if (!call) throw new Error("Không thể tạo cuộc gọi");

    // ✅ Gọi đúng theo định nghĩa mới
    await call.placeCall(true, isVideo);

    call.on(CallEvent.FeedsChanged, () => {
        const remoteFeed = call.getRemoteFeeds().find((f) => f.stream);
        if (remoteFeed?.stream && onRemoteStream) {
            onRemoteStream(remoteFeed.stream);
        }
    });

    call.on(CallEvent.Error, (e) => {
        console.error("Call error:", e);
    });

    call.on(CallEvent.Hangup, () => {
        console.log("Call ended");
        currentCall = null;
    });

    currentCall = call;
    onCallEstablished?.(call);
    return call;
};

export const endCall = () => {
    if (currentCall) {
        currentCall.hangup(CallErrorCode.UserHangup, false);
        currentCall = null;
    }
};

export const getCurrentCall = () => currentCall;
