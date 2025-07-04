"use client";

import { useEffect, useState } from "react";
import { Room } from "matrix-js-sdk";
import { getUserRooms } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function useSortedRooms() {
  const client = useMatrixClient();
  const [rooms, setRooms] = useState<Room[]>([]);

  const getLastEventTimestamp = (room: Room): number => {
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = [...events]
      .reverse()
      .find((e) => e.getType() === "m.room.message" && !e.isRedacted());
    return lastEvent?.getTs() ?? 0;
  };

  const loadRooms = async () => {
    const res = await getUserRooms(client!);
    if (res.success && res.rooms) {
      const sorted = res.rooms.sort(
        (a, b) => getLastEventTimestamp(b) - getLastEventTimestamp(a)
      );
      setRooms(sorted);
    }
  };

  useEffect(() => {
    if (!client) return;

    loadRooms();

    const handleTimeline = () => {
      setRooms((prev) =>
        [...prev].sort(
          (a, b) => getLastEventTimestamp(b) - getLastEventTimestamp(a)
        )
      );
    };

    client.on("Room.timeline" as any, handleTimeline);
    return () => {
      client.removeListener("Room.timeline" as any, handleTimeline);
    };
  }, [client]);

  return { rooms, refreshRooms: loadRooms };
}
