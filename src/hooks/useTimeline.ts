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
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus)
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
        status: "sent"
      });
      const userId = client.getUserId();
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

      // // Lấy tất cả tin nhắn của mình trong phòng
      // const myMessages = (useChatStore.getState().messagesByRoom[roomId] || [])
      //   .filter((msg) => msg.sender === userId);

      // myMessages.forEach((msg) => {
      //   //Tìm MatrixEvent tương ứng với eventId
      //   const matrixEvent = room.getLiveTimeline().getEvents().find(
      //     (e: any) => typeof e.getId === "function" && e.getId() === msg.eventId
      //   );
      //   if (!matrixEvent) return;
      //   // Lấy tất cả receipt cho eventId này
      //   const receipts = room.getReceiptsForEvent(matrixEvent) as any[] | undefined;
      //   //console.log(receipts);
      //   if (receipts && receipts.length > 0) {
      //     receipts.forEach((receipt) => {
      //       if (receipt.userId === userId) return; // bỏ qua chính mình
      //       if (receipt.type === "m.read" || receipt.type === "m.delivered") {
      //         const newStatus = receipt.type === "m.read" ? "read" : "delivered";
      //         if (msg.status !== newStatus) {
      //           updateMessageStatus(
      //             roomId,
      //             null,
      //             msg.eventId,
      //             newStatus
      //           );
      //           console.log("update message status")
      //         }
      //       }
      //     });
      //   }
      // });
    };

    client.on("Room.receipt" as any, onReceipt);

    return () => {
      isMounted = false;
      client.removeListener("Room.timeline" as any, onTimeline);
      client.removeListener("Room.receipt" as any, onReceipt);
    };
  }, [roomId]);
};
