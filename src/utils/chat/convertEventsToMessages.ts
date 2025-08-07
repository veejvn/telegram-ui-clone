// src/utils/chat/convertEventsToMessages.ts

import type { MatrixClient, MatrixEvent } from "matrix-js-sdk";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { Message, MessageType, MessageStatus } from "@/stores/useChatStore";
import { FileInfo, ImageInfo } from "@/types/chat";
import { Metadata } from "@/utils/chat/send-message/getVideoMetadata";

export function convertEventsToMessages(
  events: MatrixEvent[],
  client?: MatrixClient
): Message[] {
  // Filter only message events và loại bỏ edit events
  const messageEvents = events.filter((e) => {
    if (e.getType() !== "m.room.message") return false;

    const content = e.getContent();
    // Skip edit events (messages with m.relates_to and rel_type "m.replace")
    if (
      content["m.relates_to"] &&
      content["m.relates_to"].rel_type === "m.replace"
    ) {
      return false;
    }
    return true;
  });

  // Tạo map của edit events theo eventId gốc (giống như trong getTimeline)
  const editEvents = new Map<string, any>();
  events.forEach((event) => {
    const content = event.getContent();
    if (
      content["m.relates_to"] &&
      content["m.relates_to"].rel_type === "m.replace"
    ) {
      const originalEventId = content["m.relates_to"].event_id;
      if (originalEventId) {
        editEvents.set(originalEventId, event);
      }
    }
  });

  return messageEvents.map((event) => {
    const content = event.getContent();
    const sender = event.getSender() ?? "Unknown";
    const senderDisplayName = event.sender?.name ?? sender;
    const timestamp = event.getTs();
    const time = new Date(timestamp).toLocaleString();
    const eventId = event.getId() || "";
    const isRedacted = event.isRedacted();
    const isDeleted = isRedacted;

    let text = isRedacted ? "Tin nhắn đã thu hồi" : content.body ?? "";
    let isEdited = false;

    // Check if this message has been edited (giống như trong getTimeline)
    const editEvent = editEvents.get(eventId);
    if (editEvent) {
      const editContent = editEvent.getContent();
      if (editContent["m.new_content"] && editContent["m.new_content"].body) {
        text = editContent["m.new_content"].body;
        isEdited = true;
      }
    } else {
      // Check if this is an original edit message (fallback)
      if (content["m.new_content"]) {
        text = content["m.new_content"].body ?? text;
        isEdited = true;
      } else if (content.body && content.body.startsWith("* ")) {
        text = content.body.substring(2);
        isEdited = true;
      }
    }

    // Đặt status = "read" cho tin nhắn cũ
    let status: MessageStatus = "read";

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
    let isForward: boolean = false;
    let isReply: boolean = false;

    // Check if message is forward or reply by parsing JSON (giống như trong getTimeline)
    try {
      const parsedText = JSON.parse(text);
      if (parsedText.forward && parsedText.text && parsedText.originalSender) {
        isForward = true;
      } else if (parsedText.reply && parsedText.text && parsedText.replyTo) {
        isReply = true;
      }
    } catch (e) {
      // Not JSON, continue with normal parsing
    }

    // Determine message type and extract relevant data (giống như trong getTimeline)
    if (content.msgtype === "m.image") {
      type = "image";
      const mxcUrl = content.url;
      if (mxcUrl && client) {
        imageUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, "scale", true);
      } else {
        imageUrl = content.url;
      }
      imageInfo = { width: content.info?.w, height: content.info?.h };
    } else if (content.msgtype === "m.video") {
      type = "video";
      if (content.url) {
        if (client) {
          videoUrl = client.mxcUrlToHttp(content.url);
        } else {
          videoUrl = content.url;
        }
        videoInfo = {
          width: content.info?.w,
          height: content.info?.h,
          duration: content.info?.duration,
        };
      }
    } else if (content.msgtype === "m.file") {
      type = "file";
      if (content.url) {
        if (client) {
          fileUrl = client.mxcUrlToHttp(content.url);
        } else {
          fileUrl = content.url;
        }
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
        content["org.matrix.msc3488.location"]?.description ?? content["body"];
      if (geo_uri) {
        const [, latStr, lonStr] =
          geo_uri.match(/geo:([0-9.-]+),([0-9.-]+)/) || [];
        latitude = parseFloat(latStr);
        longitude = parseFloat(lonStr);
      }
    } else if (content.msgtype === "m.audio") {
      type = "audio";
      if (content.url) {
        if (client) {
          audioUrl = client.mxcUrlToHttp(content.url);
        } else {
          audioUrl = content.url;
        }
      }
      audioDuration = content.info?.duration ?? null;
    } else if (content.msgtype === "m.sticker") {
      type = "sticker";
      isStickerAnimation = content.info?.isStickerAnimation ?? false;
    } else if (isOnlyEmojis(text)) {
      type = "emoji";
    }

    return {
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
      status,
      type,
      isForward,
      isReply,
      isStickerAnimation,
      isDeleted,
      isEdited,
      location: {
        latitude,
        longitude,
        description: description ?? undefined,
      },
    } as Message;
  });
}
