import * as sdk from "matrix-js-sdk";

export function getLastSeen(room: sdk.Room, client: sdk.MatrixClient) {
    const members = room.getJoinedMembers();
    const otherMember = members.find(m => m.userId !== client.getUserId());
    if (!otherMember) return null;

    const lastActiveAgo = (otherMember as any).lastActiveAgo;
    const lastPresenceTs = (otherMember as any).lastPresenceTs;
    if (lastActiveAgo !== undefined && lastPresenceTs !== undefined) {
        const lastSeenDate = new Date(lastPresenceTs - lastActiveAgo);
        return lastSeenDate;
    }
    return null;
}