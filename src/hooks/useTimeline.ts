"use client"

import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getTimeline } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";
import { useClientStore } from "@/stores/useClientStore";
import * as sdk from "matrix-js-sdk";
import { useEffect } from "react";

export const useTimeline = (roomId: string) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessage = useChatStore((state) => state.setMessages);
  const client = useMatrixClient();

  useEffect(() => {
    if (!client || !roomId) return;

    let isMounted = true;

    getTimeline(roomId, client).then((res) => {
      if (res.success && res.timeline && isMounted) {
        setMessage(roomId, res.timeline);
      }
    });

    const onTimeline = (event: sdk.MatrixEvent, room: any, toStart: boolean) => {
      if (toStart || room.roomId !== roomId) return;
      if (event.getType() !== "m.room.message") return;

      addMessage(roomId, {
        eventId: event.getId() ?? " ",
        sender: event.getSender(),
        senderDisplayName: event.sender?.name ?? event.getSender(),
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
