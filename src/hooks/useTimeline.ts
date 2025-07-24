"use client";

//import * as sdk from "matrix-js-sdk";
import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getTimeline, sendReadReceipt } from "@/services/chatService";
import { MessageType, useChatStore } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { FileInfo, ImageInfo } from "@/types/chat";
import { Metadata } from "@/utils/chat/send-message/getVideoMetadata";
import type { Room, MatrixEvent } from "matrix-js-sdk";

export const useTimeline = (roomId: string) => {
  const client = useMatrixClient();
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessage = useChatStore((state) => state.setMessages);
  const updateMessage = useChatStore.getState().updateMessage;

  useEffect(() => {
    if (!client || !roomId) return;

    let isMounted = true;

    getTimeline(roomId, client).then((res) => {
      if (res.success && res.timeline && isMounted) {
        setMessage(roomId, res.timeline);
      }
    });

    const onTimeline = (event: MatrixEvent, room: any, toStart: boolean) => {
      if (toStart || room.roomId !== roomId) return;
      const typeEvent = event.getType();
      //console.log("Nhận sự kiện: " + typeEvent);
      const userId = client.getUserId();
      const eventId = event.getId() ?? "";
      const txnId = event.getUnsigned()?.transaction_id ?? "";
      //console.log("Event Id nhận từ onTimeline: " + eventId);
      //console.log("Transaction Id: " + txnId);

      let finalEventId = eventId;
      if (eventId.includes(":") && !eventId.startsWith("$")) {
        // Format: ~!roomId:server:txnId -> extract txnId
        const parts = eventId.split(":");
        const extractedTxnId = parts[parts.length - 1]; // Lấy phần cuối
        // ✅ Sử dụng extracted txnId làm finalEventId
        finalEventId = extractedTxnId;
        //console.log("Extracted txnId from eventId:", extractedTxnId);
      } else if (txnId) {
        // ✅ Nếu có txnId thực sự, ưu tiên dùng nó
        finalEventId = txnId;
      }

      //console.log("Final Event Id to use: " + finalEventId);

      if (typeEvent === "m.room.redaction") {
        // Lấy eventId của tin nhắn bị thu hồi
        const redactedEventId: string | undefined =
          (event as any)?.event?.redacts || // ổn định nhất
          event.getUnsigned()?.redacted_because?.redacts;

        if (redactedEventId) {
          updateMessage(roomId, redactedEventId, {
            text: "Tin nhắn đã thu hồi",
            isDeleted: true
          });
          //console.log("Đã thu hồi tin nhắn:", redactedEventId);
        } else {
          console.warn(
            "Không tìm thấy redacted event id trong redaction event",
            event
          );
        }

        return;
      }

      if (typeEvent !== "m.room.message") return;

      // const content = event.getContent();
      // const userId = client.getUserId();
      // const sender = event.getSender();
      // const senderDisplayName = event.sender?.name ?? sender;
      // const text = content.body;

      const content = event.getContent();
      const sender = event.getSender();

      const isRedacted = event.isRedacted();
      let text = isRedacted ? "Tin nhắn đã thu hồi" : content.body ?? "";
      let senderDisplayName = event.sender?.name ?? sender;
      let isForward = false;

      // ✅ Check nếu message là forward (JSON string)
      if (typeof text === "string") {
        try {
          const parsed = JSON.parse(text);
          if (parsed.forward && parsed.text && parsed.originalSender) {
            isForward = true;
            //text = parsed.text;
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
      let isStickerAnimation: boolean = false;
      let type: MessageType = "text";

      if (content.msgtype === "m.image") {
        type = "image";
        const mxcUrl = content.url;
        if (mxcUrl) {
          imageUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, "scale", true);
        }
        imageInfo = { width: content.info?.w, height: content.info?.h };
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
      } else if (content.msgtype === "m.sticker") {
        type = "sticker";
        isStickerAnimation = content.info?.isStickerAnimation ?? false;
      }

      if (isRedacted) {
        updateMessage(roomId, eventId, { text });
        console.log("Cập nhật tin nhắn ở onTimeline");
      } else {
        addMessage(roomId, {
          eventId: finalEventId,
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
          isStickerAnimation,
          location: {
            latitude,
            longitude,
            description: description ?? undefined,
          },
          isForward,
        });
        if (sender && sender !== userId) {
          const events = room.getLiveTimeline().getEvents();
          const lastEvent =
            events.length > 0 ? events[events.length - 1] : null;
          if (lastEvent) {
            sendReadReceipt(client, lastEvent);
          }
        }
      }
    };

    client.on("Room.timeline" as any, onTimeline);

    const onReceipt = async (_event: MatrixEvent, room: Room) => {
      if (room.roomId !== roomId) return;
      const userId = client.getUserId();
      if (!userId) return;

      const res = await getTimeline(roomId, client);
      if (res.success && res.timeline) {
        setMessage(roomId, res.timeline);
      }
    };

    client.on("Room.receipt" as any, onReceipt);

    // ✅ Listen cho event khi được server confirm
    const onEventUpdate = (event: MatrixEvent) => {
      if (event.getRoomId() !== roomId) return;

      const txnId = event.getUnsigned()?.transaction_id;
      const realEventId = event.getId();

      // ✅ Update event ID từ txn ID sang real ID
      if (txnId && realEventId && realEventId.startsWith("$")) {
        const updateMessage = useChatStore.getState().updateMessage;
        // console.log(
        //   "Cập nhật tin nhắn từ txnId sang realEventId",
        //   roomId,
        //   txnId,
        //   realEventId
        // );
        updateMessage(roomId, txnId, { eventId: realEventId });
      }
    };

    client.on("Room.localEchoUpdated" as any, onEventUpdate);

    return () => {
      isMounted = false;
      client.removeListener("Room.timeline" as any, onTimeline);
      client.removeListener("Room.receipt" as any, onReceipt);
      client.removeListener("Event.localEchoUpdated" as any, onEventUpdate);
    };
  }, [client, roomId]);
};
