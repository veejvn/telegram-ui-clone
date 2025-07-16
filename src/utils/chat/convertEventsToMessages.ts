// src/utils/chat/convertEventsToMessages.ts

import type { MatrixEvent } from "matrix-js-sdk";

export function convertEventsToMessages(events: MatrixEvent[]) {
  return events
    .filter(e => e.getType() === "m.room.message")
    .map(e => {
      const content: any = e.getContent();
      const base = {
        eventId: e.getId() || "",
        sender: e.getSender(),
        senderDisplayName: e.sender?.name || e.getSender(),
        time: new Date(e.getTs()).toLocaleString(),
        status: "sent" as const,
      };

      switch (content.msgtype) {
        case "m.audio":
          return {
            ...base,
            type: "audio" as const,
            audioUrl: content.url,
            audioDuration: content.info?.duration,
            text: "",           // ko có text
          };
        case "m.image":
          return {
            ...base,
            type: "image" as const,
            imageUrl: content.url,
            text: content.body,
          };
        // … các case khác (m.video, m.file) tuân theo pattern
        default:
          return {
            ...base,
            type: "text" as const,
            text: content.body,
          };
      }
    });
}
