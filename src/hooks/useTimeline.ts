"use client"

import * as sdk from "matrix-js-sdk";
import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getTimeline, sendReadReceipt } from "@/services/chatService";
import { MessageType, useChatStore } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";

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
      
      const content = event.getContent();
      const userId = client.getUserId();
      const sender = event.getSender();
      const senderDisplayName = event.sender?.name ?? sender
      const text = content.body;
      const ts = event.getTs();
      const time = new Date(ts).toLocaleString()

      let imageUrl : string | null = null
      let videoUrl: string | null = null;
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let type : MessageType = "text"

      if (content.msgtype === "m.image") {
        type = "image";
        const mxcUrl = content.url;
        console.log('Original MXC URL:', mxcUrl);
        if (mxcUrl) {
          imageUrl =  client.mxcUrlToHttp(mxcUrl, 800, 600, 'scale', true);
        }
        console.log('Generated HTTP URL:', imageUrl);
      } else if (content.msgtype === "m.video") {
        type = "video";
        if (content.url) {
          videoUrl = client.mxcUrlToHttp(content.url);
        }
      } else if (content.msgtype === "m.file") {
        type = "file";
        if (content.url) {
          fileUrl = client.mxcUrlToHttp(content.url);
          fileName = content.body ?? "file";
        }
      } else if (isOnlyEmojis(text)) {
        type = "emoji";
      } else {
        type = "text";
      }
      
      addMessage(roomId, {
        eventId: userId ?? "",
        sender,
        senderDisplayName,
        text,
        imageUrl,
        videoUrl,
        fileUrl,
        fileName,
        time,
        status: "sent",
        type,
      });
      
      if(sender && sender !== userId){
        updateLastSeen(roomId, sender, ts);
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
