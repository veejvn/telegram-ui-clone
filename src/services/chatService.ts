/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as sdk from "matrix-js-sdk";
import { Message, MessageStatus, MessageType } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { MatrixAuthService } from "./matrixAuthService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useClientStore } from "@/stores/useClientStore";

const authService = new MatrixAuthService();

export const getUserRooms = async (
  client: sdk.MatrixClient
): Promise<{
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
    if (!room) return { success: false };

    // ✅ Load thêm 100 sự kiện cũ nếu chưa có
    await client.scrollback(room, 100);

    const userId = client.getUserId();
    const messages = room.getLiveTimeline().getEvents() || [];

    // ✅ Tìm eventId cuối cùng được user khác read (receipt "m.read")
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
      lastReadIndex = messages.findIndex((e) => e.getId() === lastReadEventId);
    }

    // ✅ Parse message
    const parsedMessages: Message[] = messages
      .filter((e) => e.getType() === "m.room.message")
      .map((event, idx) => {
        const content = event.getContent();
        const sender = event.getSender() ?? "Unknown";
        const senderDisplayName = event.sender?.name ?? sender;
        const timestamp = event.getTs();
        const time = new Date(timestamp).toLocaleString();
        const eventId = event.getId() || "";
        const text = content.body ?? "";

        let status: MessageStatus = "sent";
        if (sender === userId && lastReadIndex !== -1 && idx <= lastReadIndex) {
          status = "read";
        }

        let imageUrl: string | null = null;
        let videoUrl: string | null = null;
        let fileUrl: string | null = null;
        let fileName: string | null = null;
        let type: MessageType = "text";

        if (content.msgtype === "m.image") {
          type = "image";
          const mxcUrl = content.url;
          if (mxcUrl) {
            imageUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, "scale", true);
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
        }

        return {
          eventId,
          sender,
          senderDisplayName,
          text,
          time,
          timestamp,
          imageUrl,
          videoUrl,
          fileUrl,
          fileName,
          status,
          type,
        };
      });

    return {
      success: true,
      timeline: parsedMessages,
    };
  } catch (error) {
    return {
      success: false,
      err: error,
    };
  }
};

export const getOlderMessages = async (
  roomId: string,
  client: sdk.MatrixClient,
  limit = 20
) => {
  const room = client.getRoom(roomId);
  if (!room) return [];

  // 👇 Kiểm tra có thể scrollback không
  const canBackPaginate = !!room
    .getLiveTimeline()
    .getPaginationToken(sdk.EventTimeline.BACKWARDS);
  if (!canBackPaginate) return [];

  await client.scrollback(room, limit);

  const timeline = room.getLiveTimeline();
  return timeline.getEvents();
};

export const getRoom = async (
  roomId: string | undefined
): Promise<{
  success: boolean;
  err?: any;
  room?: sdk.Room;
}> => {
  const client = useMatrixClient();
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }

  try {
    const result: sdk.Room | null = await client.getRoom(roomId);

    if (result) {
      console.clear();
      console.log(
        "%cGet room successful, room: " + result.name,
        "color: green"
      );

      return {
        success: true,
        room: result,
      };
    } else {
      console.clear();
      console.log("Get room failed !");
      return {
        success: false,
        err: "Invalid room, check room_id !",
      };
    }
  } catch (error) {
    return { success: false, err: error };
  }
};

export const getUserInfoInPrivateRoom = async (
  roomId: string,
  client: sdk.MatrixClient
): Promise<{
  success: boolean;
  err?: any;
  user?: sdk.User;
}> => {
  if (!client) {
    return {
      success: false,
      err: "Matrix client is not initialized.",
    };
  }

  if (!roomId) {
    return {
      success: false,
      err: "Invalid roomId.",
    };
  }

  try {
    const userId = useAuthStore.getState().userId;

    const room = client.getRoom(roomId);

    if (!room) {
      return {
        success: false,
        err: `Room not found: ${roomId}`,
      };
    }

    const allMembers = room.getMembers();
    const otherMember = allMembers.find(
      (member: sdk.RoomMember) => member.userId !== userId
    );

    if (!otherMember) {
      return {
        success: false,
        err: "No other member found in the room.",
      };
    }

    const user = client.getUser(otherMember.userId);

    if (!user) {
      return {
        success: false,
        err: "Could not fetch user via client.getUser().",
      };
    }

    console.log(
      "%c✅ Fetched user: " + user.displayName,
      "color: green; font-weight: bold;"
    );

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("❌ Error in getUserInfoInPrivateRoom:", error);
    return { success: false, err: error };
  }
};

export async function sendImageMessage(
  client: sdk.MatrixClient,
  roomId: string,
  file: File
) {
  try {
    const content = await readFileAsArrayBuffer(file);

    const uploadResponse = await client.uploadContent(content, {
      name: file.name,
      type: file.type,
    });

    const dimentions = await getImageDimensions(file);

    const imageMessage = {
      msgtype: "m.image",
      body: file.name,
      url: uploadResponse.content_uri,
      info: {
        mimetype: file.type,
        size: file.size,
        w: dimentions.width,
        h: dimentions.height,
      },
    };

    await client.sendMessage(roomId, imageMessage as any);
  } catch (err) {
    console.error("sendImageMessage error:", err);
    throw err;
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as ArrayBuffer);
      } else {
        reject(new Error("Empty result from FileReader"));
      }
    };
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

const getImageDimensions = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const sendReadReceipt = async (client: sdk.MatrixClient, event: any) => {
  if (
    !client ||
    !event ||
    typeof event.getId !== "function" ||
    typeof event.getRoomId !== "function" ||
    !event.getId() ||
    !event.getRoomId()
  )
    return;
  try {
    await client.sendReadReceipt(event);
  } catch (err) {
    console.error("Failed to send read receipt:", err);
  }
};

export const sendTypingEvent = async (
  roomId: string,
  isTyping: boolean
): Promise<{ success: boolean; err?: any }> => {
  const client = useClientStore.getState().client;

  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }

  try {
    await client.sendTyping(roomId, isTyping, isTyping ? 30000 : 0); // Timeout khi isTyping=true
    return { success: true };
  } catch (err) {
    return { success: false, err };
  }
};
