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
  let isForwarded = false;

  if (lastValidEvent) {
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
      if(text.startsWith("STICKER::")){
        text = "send a sticker"
      }else if(isOnlyEmojis(text)){
        text = "send a icon"
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
          text = "sent a audio";
          break;
        default:
          text = "sent a message";
      }
    }
  } else {
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

  let senderName: string = senderId || "Unknown";
  if (senderId === userId) {
    senderName = "You";
  } else {
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
