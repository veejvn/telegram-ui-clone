/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useTypingStore } from "@/stores/useTypingStore";
import { useEffect } from "react";

export default function useTyping(roomId: string) {
  const client = useMatrixClient();
  const setTypingUsers = useTypingStore.getState().setTyping;

  useEffect(() => {
    if (!client || !roomId) return;

    const onTyping = (_event: any, member: any) => {
      if (member.roomId === roomId) {
        setTypingUsers((prev) => ({
          ...prev,
          [member.userId]: member.typing,
        }));
      }
    };

    client.on("RoomMember.typing" as any, onTyping);

    return () => {
      client.removeListener("RoomMember.typing" as any, onTyping);
    };
  }, [client, roomId]);
}
