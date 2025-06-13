/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getTimeline } from "@/services/chatServices";
import { useChatStore } from "@/stores/useChatStore";
import { useClientStore } from "@/stores/useClientStore";
import { MatrixEvent } from "matrix-js-sdk";
import { useEffect } from "react";

export const useTimeline = (roomId: string) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessage = useChatStore((state) => state.setMessages);

  useEffect(() => {
    const client = useClientStore.getState().client;
    if (!client || !roomId) return;

    let isMounted = true;

    getTimeline(roomId).then((res) => {
      if (res.success && res.timeline && isMounted) {
        setMessage(roomId, res.timeline);
      }
    });

    const onTimeline = (event: MatrixEvent, room: any, toStart: boolean) => {
      if (toStart || room.roomId !== roomId) return;
      if (event.getType() !== "m.room.message") return;

      addMessage(roomId, {
        eventId: event.getId() ?? " ",
        sender: event.getSender(),
        text: event.getContent().body,
        time: new Date(event.getTs()).toLocaleString(),
      });
    };

    client.on("Room.timeline" as any, onTimeline);

    return () => {
      isMounted = false;
      client.removeListener("Room.timeline" as any, onTimeline);
    };
  }, [roomId]);
};
