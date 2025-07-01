import { MatrixEvent, Room } from "matrix-js-sdk";
import { useEffect, useState } from "react";

export default function useUnreadMessages(room: Room | null, userId: string) {
  const [unreadMsgs, setUnreadMsgs] = useState<MatrixEvent[]>([]);

  useEffect(() => {
    if (!room || !userId) return;

    const computeUnread = () => {
      const timelineEvents = room.getLiveTimeline().getEvents();
      const userReadUpTo = room.getEventReadUpTo(userId);

      const result: MatrixEvent[] = [];

      if (!userReadUpTo) {
        setUnreadMsgs(
          timelineEvents.filter((e) => e.getType() === "m.room.message")
        );
        return;
      }

      let found = false;
      for (const event of timelineEvents) {
        if (event.getType() !== "m.room.message") continue;

        if (found) {
          result.push(event);
        }

        if (event.getId() === userReadUpTo) {
          found = true;
        }
      }

      setUnreadMsgs(result);
    };

    computeUnread(); // lần đầu

    // 🔁 Re-compute khi có tin nhắn mới hoặc đã đọc
    const handleUpdate = (event: MatrixEvent, r: Room) => {
      if (r.roomId === room.roomId) {
        computeUnread();
      }
    };

    room.on("Room.timeline", handleUpdate);
    room.on("Room.receipt", handleUpdate);

    return () => {
      room.off("Room.timeline", handleUpdate);
      room.off("Room.receipt", handleUpdate);
    };
  }, [room, userId]);

  return unreadMsgs;
}
