// hooks/useSortedRooms.ts
import { useEffect, useState } from "react";
import { Room } from "@/lib/matrix-sdk";
import { getUserRooms } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function useSortedRooms() {
  const client = useMatrixClient();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true); // 👈 trạng thái loading

  const getLastEventTimestamp = (room: Room): number => {
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = [...events]
      .reverse()
      .find((e) => e.getType() === "m.room.message" && !e.isRedacted());
    return lastEvent?.getTs() ?? 0;
  };

  const refreshRooms = async () => {
    if (!client) return;
    setLoading(true); // 👈 start
    const res = await getUserRooms(client);
    if (res.success && res.rooms) {
      const sorted = res.rooms.sort(
        (a, b) => getLastEventTimestamp(b) - getLastEventTimestamp(a)
      );
      setRooms(sorted);
    }
    setLoading(false); // 👈 done
  };

  useEffect(() => {
    refreshRooms();

    const handleTimeline = () => {
      setRooms((prev) =>
        [...prev].sort(
          (a, b) => getLastEventTimestamp(b) - getLastEventTimestamp(a)
        )
      );
    };

    client?.on("Room.timeline" as any, handleTimeline);
    return () => {
      client?.removeListener("Room.timeline" as any, handleTimeline);
    };
  }, [client]);

  return { rooms, loading, refreshRooms };
}
