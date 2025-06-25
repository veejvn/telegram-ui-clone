import type { MatrixEvent } from "matrix-js-sdk";

export function convertEventsToMessages(events: MatrixEvent[]) {
  return events
    .filter((event) => event.getType() === "m.room.message")
    .map((event) => ({
      eventId: event.getId() ?? "",
      sender: event.getSender(),
      senderDisplayName: event.sender?.name ?? event.getSender(),
      text: event.getContent().body,
      time: new Date(event.getTs()).toLocaleString(),
      status: "sent",
    }));
}
