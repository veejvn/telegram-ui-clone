/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as sdk from "matrix-js-sdk";
import { Message, useChatStore } from "@/stores/useChatStore";

export const getUserRooms = async (client: sdk.MatrixClient): Promise<{
  success: boolean;
  err?: any;
  rooms?: sdk.Room[];
}> => {
  if (!client) {
    return {
      success: false,
      err: "Client could not be authenticated",
    };
  }

  try {
    const rooms = client.getRooms ? client.getRooms() : [];
    console.clear();
    console.log(
      "%cGet User room list successful --> Number Of Rooms: " + rooms.length,
      "color: green"
    );
    return {
      success: true,
      rooms,
    };
  } catch (error: any) {
    return {
      success: false,
      err: error?.message,
    };
  }
};

export const sendMessage = async (
  roomId: string,
  message: string,
  client: sdk.MatrixClient
): Promise<{
  success: boolean;
  err?: any;
}> => {
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }
  const txtId = "mgs_" + Date.now();
  try {
    await client.sendTextMessage(roomId, message, txtId);

    return {
      success: true,
    };
  } catch (error) {
    return { success: false, err: error };
  }
};

export const getTimeline = async (
  roomId: string,
  client: sdk.MatrixClient
): Promise<{
  success: boolean;
  err?: any;
  timeline?: Message[];
}> => {
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }

  try {
    const room = client.getRoom(roomId);
    if(!room) return { success: false}

    const userId = client.getUserId()
    const messages = room.getLiveTimeline().getEvents().slice(-20) || [];

    // 1. Tìm eventId cuối cùng đã được đọc (có receipt "m.read" từ user khác)
    let lastReadEventId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const event = messages[i];
      if (event.getType() === "m.room.message") {
        const receipts = room.getReceiptsForEvent(event) as any[] | undefined;
        if (receipts && receipts.length > 0) {
          const otherReceipt = receipts.find(
            (r) => r.userId !== userId && r.type === "m.read"
          );
          if (otherReceipt) {
            lastReadEventId = event.getId() || null;
            break;
          }
        }
      }
    }

    let lastReadIndex = -1;
    if (lastReadEventId) {
      lastReadIndex = messages.findIndex(e => e.getId() === lastReadEventId);
    }

    if (messages) {
      const res: Message[] = [];
      messages.map((event, idx) => {
        if (event.getType() === "m.room.message") {
          let status: "sent" | "delivered" | "read" = "sent";
          const sender = event.getSender() ?? "Unknown";
          const content = event.getContent();
          const text = content.body;
          const senderDisplayName = event.sender?.name ?? sender;
          const timestamp = event.getTs(); // -> timestamp dạng milliseconds (Unix time)
          const time = new Date(timestamp).toLocaleString(); // chuyển sang định dạng dễ đọc
          const eventId = event.getId() || "";

          if(sender === userId && lastReadIndex !== -1 && idx <= lastReadIndex){
            status = "read";
          }

          res.push({ eventId, time, senderDisplayName, sender, text, status });
        }
      });

      return {
        success: true,
        timeline: res,
      };
    } else {
      return {
        success: false,
        err: "Failed to load timeline message",
      };
    }
  } catch (error) {
    return { success: false, err: error };
  }
};
