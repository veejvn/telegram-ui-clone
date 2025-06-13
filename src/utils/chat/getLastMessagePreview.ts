import { MatrixAuthService } from "@/services/matrixAuthService";
import * as sdk from "matrix-js-sdk";
import { formatTime } from "./formatTimeString";

const authService = new MatrixAuthService();
const { userId: currentUserId } = authService.getCurrentUser();

export const getLastMessagePreview = (
  room: sdk.Room
): {
  content?: string;
  time: string;
  sender?: string;
} => {
  const timeline = room.timeline;
  const lastEvent = timeline[timeline.length - 1];

  let text = "";
  let timestamp = 0;
  let senderId = "";

  if (lastEvent && lastEvent.getType() === "m.room.message") {
    const msgType = lastEvent.getContent()?.msgtype;

    switch (msgType) {
      case "m.text":
        text = lastEvent.getContent().body;
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

    timestamp = lastEvent.getTs();
    senderId = lastEvent.getSender() || "";
  } else {
    const creationEvent = room.currentState.getStateEvents("m.room.create", "");
    timestamp = creationEvent?.getTs?.() || Date.now();
    text = "Room created";
  }

  let senderName: string = senderId || "Unknown";
  if (senderId === currentUserId) {
    senderName = "You";
  } else {
    const member: sdk.RoomMember | null = room.getMember(senderId || "");
    senderName = member?.name || senderId || "Unknown";
  }

  return {
    content: text,
    time: formatTime(timestamp),
    sender: senderName,
  };
};
