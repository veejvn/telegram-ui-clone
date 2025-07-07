"use client";
import * as sdk from "matrix-js-sdk";
import { formatTime } from "./formatTimeString";
import { useAuthStore } from "@/stores/useAuthStore";

export const getLastMessagePreview = (
  room: sdk.Room
): {
  content?: string;
  time: string;
  sender?: string;
} => {
  const timeline = room.getLiveTimeline().getEvents();
  const userId = useAuthStore.getState().userId;

  // 🔁 Tìm event hợp lệ gần nhất từ cuối timeline
  const lastValidEvent = [...timeline].reverse().find((event) => {
    return (
      event.getType() === "m.room.message" &&
      !event.isRedacted() &&
      !!event.getContent()?.msgtype
    );
  });

  let text = "";
  let timestamp = 0;
  let senderId = "";

  if (lastValidEvent) {
    const content = lastValidEvent.getContent();
    const msgType = content.msgtype;

    switch (msgType) {
      case "m.text":
        text = content.body;
        break;
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
      default:
        text = "sent a message";
    }

    timestamp = lastValidEvent.getTs();
    senderId = lastValidEvent.getSender() || "";
  } else {
    const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
    const creationEvent = state?.getStateEvents("m.room.create", "");

    if (creationEvent) {
      timestamp = creationEvent.getTs?.() || Date.now();
      text = "Room created";
      senderId = "";
    } else {
      // fallback cuối cùng nếu không có gì cả
      timestamp = Date.now();
      text = "No messages yet";
      senderId = "";
    }
  }

  let senderName: string = senderId || "Unknown";
  if (senderId === userId) {
    senderName = "You";
  } else {
    const member: sdk.RoomMember | null = room.getMember(senderId || "");
    senderName = member?.name || senderId || "Unknown";
  }

  const roomId = room.roomId;
  

  return {
    content: text,
    time: formatTime(timestamp),
    sender: senderName,
  };
};
