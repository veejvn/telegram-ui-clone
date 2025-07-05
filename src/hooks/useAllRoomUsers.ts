/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { RoomMember } from "matrix-js-sdk";
import { useEffect, useState } from "react";

export type RoomUser = {
  checked: any;
  userId: string;
  displayName: string;
  avatarUrl?: string;
};

export default function useAllRoomUsers() {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const client = useMatrixClient();

  useEffect(() => {
    if (!client) return;

    const currentUserId = client.getUserId();

    const rooms = client.getRooms();

    const userMap = new Map<string, RoomUser>();

    rooms.forEach((room) => {
      const members = room.getJoinedMembers();
      members.forEach((member: RoomMember) => {
        const user = client.getUser(member.userId);
        if (
          user &&
          user.userId !== currentUserId &&
          !userMap.has(user.userId)
        ) {
          userMap.set(user.userId, {
            userId: user.userId,
            displayName: user.displayName || user.userId,
            avatarUrl: user.avatarUrl,
            checked: undefined,
          });
        }
      });
    });
    setUsers(Array.from(userMap.values()));
  }, [client]);
  return users;
}
