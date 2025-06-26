import { Message } from "@/stores/useChatStore";

export const groupMessagesByDate = (messages: Message[]) => {
  const grouped: Record<string, Message[]> = {};

  for (const msg of messages) {
    if (msg.timestamp === undefined) {
      continue;
    }
    const date = new Date(msg.timestamp);
    const dateLabel = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }); // "June 16"

    if (!grouped[dateLabel]) grouped[dateLabel] = [];
    grouped[dateLabel].push(msg);
  }

  return grouped;
};
