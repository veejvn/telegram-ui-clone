/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as sdk from "matrix-js-sdk";
import { Message, MessageStatus, MessageType } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";

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
          const sender = event.getSender() ?? "Unknown";
          const content = event.getContent();
          const text = content.body ?? "";
          const senderDisplayName = event.sender?.name ?? sender;
          const timestamp = event.getTs(); // -> timestamp dạng milliseconds (Unix time)
          const time = new Date(timestamp).toLocaleString(); // chuyển sang định dạng dễ đọc
          const eventId = event.getId() || "";
          
          let status: MessageStatus = "sent";
          if(sender === userId && lastReadIndex !== -1 && idx <= lastReadIndex){
            status = "read";
          }

          let imageUrl : string | null = null
          let videoUrl: string | null = null;
          let fileUrl: string | null = null;
          let fileName: string | null = null;
          let type : MessageType = "text"

          if (content.msgtype === "m.image") {
            type = "image";
            if (content.url) {
              imageUrl = client.mxcUrlToHttp(content.url, 800, 800, "scale");
            }
          } else if (content.msgtype === "m.video") {
            type = "video";
            if (content.url) {
              videoUrl = client.mxcUrlToHttp(content.url);
            }
          } else if (content.msgtype === "m.file") {
            type = "file";
            if (content.url) {
              fileUrl = client.mxcUrlToHttp(content.url);
              fileName = content.body ?? "file";
            }
          } else if (isOnlyEmojis(text)) {
            type = "emoji";
          } else {
            type = "text";
          }

          res.push({ eventId, time, senderDisplayName, sender, text, imageUrl, videoUrl, fileUrl, fileName, status, type });
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

export async function sendImageMessage(
  client: sdk.MatrixClient,
  roomId: string,
  file: File
) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const content = reader.result as ArrayBuffer;

        const uploadRes = await client.uploadContent(content, {
          name: file.name,
          type: file.type,
        });

        const imageMessage = {
          msgtype: "m.image",
          body: file.name,
          url: uploadRes.content_uri,
          info: {
            mimetype: file.type,
            size: file.size,
            w: 500,
            h: 500,
          },
        };
        const event = await client.sendMessage(roomId, imageMessage as any);
        resolve(event);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error("File read error"));
    };

    reader.readAsArrayBuffer(file);
  });
}
