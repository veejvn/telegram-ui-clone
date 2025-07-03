import { MatrixEvent, Room } from "matrix-js-sdk";
import { useEffect, useState } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";

export default function useUnreadMessages(room: Room | null) {
  const [unreadMsgs, setUnreadMsgs] = useState<MatrixEvent[]>([]);
  const client = useMatrixClient();
  const userId = useAuthStore.getState().userId;

  useEffect(() => {
    if (!room || !client || !userId) return;

    const computeUnread = () => {
      const timelineEvents = room.getLiveTimeline().getEvents();
      const userReadUpTo = room.getEventReadUpTo(userId);

      const result: MatrixEvent[] = [];

      if (!userReadUpTo) {
        result.push(
          ...timelineEvents.filter(
            (e) =>
              e.getType() === "m.room.message" &&
              !e.isRedacted() &&
              e.getSender() !== userId
          )
        );
      } else {
        let found = false;
        for (const event of timelineEvents) {
          if (event.getType() !== "m.room.message") continue;
          if (event.getSender() === userId) continue;

          if (found) result.push(event);
          if (event.getId() === userReadUpTo) found = true;
        }
      }

      setUnreadMsgs(result);
    };

    computeUnread();

    const onTimeline = (event: MatrixEvent, eventRoom: Room) => {
      if (eventRoom.roomId === room.roomId) computeUnread();
    };

    const onReceipt = (event: MatrixEvent, eventRoom: Room) => {
      if (eventRoom.roomId === room.roomId) computeUnread();
    };

    client.on("Room.timeline" as any, onTimeline);
    client.on("Room.receipt" as any, onReceipt);

    return () => {
      client.removeListener("Room.timeline" as any, onTimeline);
      client.removeListener("Room.receipt" as any, onReceipt);
    };
  }, [room, client, userId]);

  return unreadMsgs;
}
