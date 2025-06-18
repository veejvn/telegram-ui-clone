"use client"

import * as sdk from "matrix-js-sdk";
import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getTimeline } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";
import { sendReadReceipt } from "@/utils/chat/sendReceipt";

export const useTimeline = (roomId: string) => {
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessage = useChatStore((state) => state.setMessages);
  const updateLastSeen = useChatStore((state) => state.updateLastSeen);
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
      
      const userId = client.getUserId();
      const sender = event.getSender();
      const ts = event.getTs();
      const content = event.getContent();

      // addMessage(roomId, {
      //   eventId: event.getId() ?? " ",
      //   sender: event.getSender(),
      //   senderDisplayName: event.sender?.name ?? event.getSender(),
      //   text: event.getContent().body,
      //   time: new Date(event.getTs()).toLocaleString(),
      //   status: "sent"
      // });

      if (content.msgtype === "m.image") {
        // Tin nhắn là hình ảnh
        addMessage(roomId, {
          eventId: event.getId() ?? " ",
          sender: sender,
          senderDisplayName: event.sender?.name ?? sender,
          imageUrl: client.mxcUrlToHttp(content.url, 800, 800, "scale"), // Tạo URL từ mxc
          text: content.body,
          time: new Date(ts).toLocaleString(),
          status: "sent",
          type: "image",
        });
        console.log("Có ảnh")
      } else if (content.msgtype === "m.text") {
        // Tin nhắn văn bản
        addMessage(roomId, {
          eventId: event.getId() ?? " ",
          sender: sender,
          senderDisplayName: event.sender?.name ?? sender,
          text: content.body,
          time: new Date(ts).toLocaleString(),
          status: "sent",
          type: "text",
        });
      }

      if (sender && sender !== userId) {
        updateLastSeen(roomId, sender, ts);
      }

      if(event.getSender() !== userId){
        const events = room.getLiveTimeline().getEvents();
        const lastEvent = events.length > 0 ? events[events.length - 1] : null;
        if (lastEvent) {
          sendReadReceipt(client, lastEvent);
        }
      }
    };

    client.on("Room.timeline" as any, onTimeline);

    const onReceipt = async (_event: sdk.MatrixEvent, room: sdk.Room) => {
      if (room.roomId !== roomId) return;
      const userId = client.getUserId();
      if (!userId) return;

      // Gọi lại getTimeline để cập nhật toàn bộ trạng thái tin nhắn
      const res = await getTimeline(roomId, client);
      if (res.success && res.timeline) {
        setMessage(roomId, res.timeline);
      }
    };

    client.on("Room.receipt" as any, onReceipt);

    return () => {
      isMounted = false;
      client.removeListener("Room.timeline" as any, onTimeline);
      client.removeListener("Room.receipt" as any, onReceipt);
    };
  }, [roomId]);
};
