"use client";
import * as sdk from "matrix-js-sdk";
import { formatTime } from "./formatTimeString";
import { useAuthStore } from "@/stores/useAuthStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";

export const getLastMessagePreview = (
  room: sdk.Room
): {
  content?: string;
  time: string;
  sender?: string;
  isForwarded: boolean;
} => {
  const timeline = room.getLiveTimeline().getEvents();
  const userId = useAuthStore.getState().userId;

  // ✅ Lọc ra chỉ các tin nhắn hợp lệ (không bị redacted)
  const validMessages = timeline
    .filter(
      (event) => event.getType() === "m.room.message" && !event.isRedacted()
    )
    .reverse(); // Sắp xếp từ mới nhất đến cũ nhất

  let text = "";
  let timestamp = 0;
  let senderId = "";
  let isForwarded = false;

  // ✅ Lấy tin nhắn cuối cùng không bị xóa
  if (validMessages.length > 0) {
    const lastValidEvent = validMessages[0]; // Tin nhắn mới nhất
    const content = lastValidEvent.getContent();
    const msgType = content.msgtype;

    timestamp = lastValidEvent.getTs();
    senderId = lastValidEvent.getSender() || "";

    if (msgType === "m.text" && typeof content.body === "string") {
      try {
        const parsed = JSON.parse(content.body);
        if (parsed.forward && parsed.text) {
          text = parsed.text;
          isForwarded = true;
        } else {
          text = content.body;
        }
      } catch {
        text = content.body;
      }

      if (isOnlyEmojis(text)) {
        text = "send a icon";
      }
    } else {
      switch (msgType) {
        case "m.image":
          text = "sent an image";
          break;
        case "m.sticker":
          text = "sent a sticker";
          break;
        case "m.file":
          text = "sent a file";
          break;
        case "m.video":
          text = "sent a video";
          break;
        case "m.location":
          text = "sent a location";
          break;
        case "m.audio":
          text = "sent a voice";
          break;
        default:
          text = "sent a message";
      }
    }
  } else {
    // ✅ Không có tin nhắn hợp lệ nào
    const hasAnyMessages = timeline.some(
      (event) => event.getType() === "m.room.message"
    );

    if (hasAnyMessages) {
      // Có tin nhắn nhưng tất cả đều bị xóa
      text = "Tin nhắn đã thu hồi";
      const lastMessage = timeline
        .filter((event) => event.getType() === "m.room.message")
        .pop();
      if (lastMessage) {
        timestamp = lastMessage.getTs();
        senderId = lastMessage.getSender() || "";
      }
    } else {
      // Không có tin nhắn nào
      const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
      const creationEvent = state?.getStateEvents("m.room.create", "");

      if (creationEvent) {
        timestamp = creationEvent.getTs?.() || Date.now();
        text = "Room created";
        senderId = "";
      } else {
        timestamp = Date.now();
        text = "No messages yet";
        senderId = "";
      }
    }
  }

  let senderName: string = senderId || "Unknown";
  if (senderId === userId) {
    senderName = "You";
  } else if (senderId) {
    const member: sdk.RoomMember | null = room.getMember(senderId);
    senderName = member?.name || senderId || "Unknown";
  }

  return {
    content: text,
    time: formatTime(timestamp),
    sender: senderName,
    isForwarded,
  };
};
