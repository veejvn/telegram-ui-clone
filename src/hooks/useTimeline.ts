"use client";

import * as sdk from "matrix-js-sdk";
import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getTimeline, sendReadReceipt } from "@/services/chatService";
import { MessageType, useChatStore } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { FileInfo, ImageInfo } from "@/types/chat";
import { Metadata } from "@/utils/chat/send-message/getVideoMetadata";

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

    const onTimeline = (
      event: sdk.MatrixEvent,
      room: any,
      toStart: boolean
    ) => {
      if (toStart || room.roomId !== roomId) return;
      if (event.getType() !== "m.room.message") return;

      // const content = event.getContent();
      // const userId = client.getUserId();
      // const sender = event.getSender();
      // const senderDisplayName = event.sender?.name ?? sender;
      // const text = content.body;

      const content = event.getContent();
      const userId = client.getUserId();
      const sender = event.getSender();
      const eventId = event.getId() || "";

      let text = content.body;
      let senderDisplayName = event.sender?.name ?? sender;
      let isForward = false;

      // ✅ Check nếu message là forward (JSON string)
      if (typeof text === "string") {
        try {
          const parsed = JSON.parse(text);
          if (parsed.forward && parsed.text && parsed.originalSender) {
            isForward = true;
            text = parsed.text;
            senderDisplayName = parsed.originalSender;
          }
        } catch (err) {
          // Not JSON, ignore
        }
      }

      const timestamp = event.getTs();
      const time = new Date(timestamp).toLocaleString();

      let imageUrl: string | null = null;
      let imageInfo: ImageInfo | null = null;
      let videoUrl: string | null = null;
      let videoInfo: Metadata | null = null;
      let fileUrl: string | null = null;
      let fileInfo: FileInfo | null = null;
      let latitude: number | null = null;
      let longitude: number | null = null;
      let description: string | null = null;
      let audioUrl: string | null = null;
      let audioDuration: number | null = null;
      let type: MessageType = "text";

      if (content.msgtype === "m.image") {
        type = "image";
        const mxcUrl = content.url;
        if (mxcUrl) {
          imageUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, "scale", true);
        }
        imageInfo = { width : content.info?.w , height : content.info?.h}
      } else if (content.msgtype === "m.video") {
        type = "video";
        if (content.url) {
          videoUrl = client.mxcUrlToHttp(content.url);
          videoInfo = {
            width: content.info?.w,
            height: content.info?.h,
            duration: content.info?.duration,
          };
        }
      } else if (content.msgtype === "m.file") {
        type = "file";
        if (content.url) {
          fileUrl = client.mxcUrlToHttp(content.url);
        }
        fileInfo = {
          fileSize: content.info?.size,
          mimeType: content.info?.mimetype,
        };
      } else if (content.msgtype === "m.location") {
        type = "location";
        const geo_uri: string =
          content["geo_uri"] || content["org.matrix.msc3488.location"]?.uri;
        description =
          content["org.matrix.msc3488.location"]?.description ??
          content["body"];
        const [, latStr, lonStr] =
          geo_uri.match(/geo:([0-9.-]+),([0-9.-]+)/) || [];
        latitude = parseFloat(latStr);
        longitude = parseFloat(lonStr);
      } else if (isOnlyEmojis(text)) {
        type = "emoji";
      } else if (content.msgtype === "m.audio") {
        type = "audio";
        if (content.url) {
          // chuyển MXC → HTTP URL
          audioUrl = client.mxcUrlToHttp(content.url);
        }
        // nếu server đẩy duration trong info
        audioDuration = content.info?.duration ?? null;
      }

      addMessage(roomId, {
        eventId,
        sender,
        senderDisplayName,
        text,
        time,
        timestamp,
        imageUrl,
        imageInfo,
        videoUrl,
        videoInfo,
        fileUrl,
        fileInfo,
        audioUrl,
        audioDuration,
        status: "sent",
        type,
        location: {
          latitude,
          longitude,
          description: description ?? undefined,
        },
        isForward,
      });

      if (sender && sender !== userId) {
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
  }, [client, roomId]);
};
