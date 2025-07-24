/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as sdk from "@/lib/matrix-sdk";
import { Message, MessageStatus, MessageType } from "@/stores/useChatStore";
import { isOnlyEmojis } from "@/utils/chat/isOnlyEmojis ";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { FileInfo, ImageInfo, LocationInfo } from "@/types/chat";
import { MatrixClient, MatrixEvent } from "@/types/matrix";
import { getVideoMetadata } from "@/utils/chat/send-message/getVideoMetadata";
import { Metadata } from "@/utils/chat/send-message/getVideoMetadata";

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

    //console.log(messages.filter((e) => e.getType() === "m.room.message"))

    // ✅ Tìm eventId cuối cùng được user khác read (receipt "m.read")
    let lastReadEventId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const event = messages[i];
      //console.log(i, event.getId(), event.getContent().body)
      if (event.getType() === "m.room.message") {
        const receipts = room.getReceiptsForEvent(event) as any[] | undefined;
        //console.log(receipts, event.getContent().body);
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
      lastReadIndex = messages
        .filter((e) => e.getType() === "m.room.message")
        .findIndex((e) => e.getId() === lastReadEventId);
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
        const isRedacted = event.isRedacted();
        const isDeleted = isRedacted;

        let text = isRedacted ? "Tin nhắn đã thu hồi" : content.body ?? "";

        //console.log(eventId);

        let status: MessageStatus = "sent";
        if (sender === userId && lastReadIndex !== -1 && idx <= lastReadIndex) {
          status = "read";
        }
        //console.log(text, sender, status, idx, lastReadIndex);

        let imageUrl: string | null = null;
        let imageInfo: ImageInfo | null = null;
        let videoUrl: string | null = null;
        let videoInfo: Metadata | null = null;
        let fileUrl: string | null = null;
        let fileInfo: FileInfo | null = null;
        let latitude: number | null = null;
        let longitude: number | null = null;
        let description: string | null = null;

        let audioUrl: string | null = null;
        let audioDuration: number | null = null;
        let isStickerAnimation: boolean = false;
        let type: MessageType = "text";

        if (content.msgtype === "m.image") {
          type = "image";
          const mxcUrl = content.url;
          if (mxcUrl) {
            imageUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, "scale", true);
          }
          imageInfo = { width: content.info?.w, height: content.info?.h };
        } else if (content.msgtype === "m.video") {
          type = "video";
          if (content.url) {
            videoUrl = client.mxcUrlToHttp(content.url);
            videoInfo = {
              width: content.info?.w,
              height: content.info?.h,
              duration: content.info?.duration,
            };
          }
        } else if (content.msgtype === "m.file") {
          type = "file";
          if (content.url) {
            fileUrl = client.mxcUrlToHttp(content.url);
          }
          fileInfo = {
            fileSize: content.info?.size,
            mimeType: content.info?.mimetype,
          };
        } else if (content.msgtype === "m.location") {
          type = "location";
          const geo_uri: string =
            content["geo_uri"] || content["org.matrix.msc3488.location"]?.uri;
          description =
            content["org.matrix.msc3488.location"]?.description ??
            content["body"];
          const [, latStr, lonStr] =
            geo_uri.match(/geo:([0-9.-]+),([0-9.-]+)/) || [];
          latitude = parseFloat(latStr);
          longitude = parseFloat(lonStr);
        } else if (isOnlyEmojis(text)) {
          type = "emoji";
        } else if (content.msgtype === "m.audio") {
          type = "audio";
          if (content.url) {
            // chuyển MXC → HTTP URL
            audioUrl = client.mxcUrlToHttp(content.url);
          }
          // nếu server đẩy duration trong info
          audioDuration = content.info?.duration ?? null;
        } else if (content.msgtype === "m.sticker") {
          type = "sticker";
          isStickerAnimation = content.info?.isStickerAnimation ?? false;
        }

        return {
          eventId,
          sender,
          senderDisplayName,
          text,
          time,
          timestamp,
          imageUrl,
          imageInfo,
          videoUrl,
          videoInfo,
          fileUrl,
          fileInfo,
          audioUrl,
          audioDuration,
          status,
          type,
          isStickerAnimation,
          isDeleted,
          location: {
            latitude,
            longitude,
            description: description ?? undefined,
          },
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

    // console.log(
    //   "%c✅ Fetched user: " + user.displayName,
    //   "color: green; font-weight: bold;"
    // );

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
    return {
      httpUrl: client.mxcUrlToHttp(
        uploadResponse.content_uri,
        800,
        600,
        "scale",
        true
      ),
      dimentions,
    };
  } catch (err) {
    console.error("sendImageMessage error:", err);
    throw err;
  }
}

export async function sendVoiceMessage(
  client: sdk.MatrixClient,
  roomId: string,
  file: File,
  duration: number // ← thêm tham số duration
) {
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
      httpUrl: "",
    };
  }
  try {
    // đọc blob thành ArrayBuffer
    const buffer = await readFileAsArrayBuffer(file);

    // upload lên Matrix homeserver
    const uploadRes = await client.uploadContent(buffer, {
      name: file.name,
      type: file.type,
    });

    // xây dựng content theo spec m.audio
    const audioContent = {
      body: file.name,
      info: {
        duration,
        mimetype: file.type,
        size: file.size,
      },
      msgtype: "m.audio",
      url: uploadRes.content_uri,
    };

    // gửi message
    await client.sendMessage(roomId, audioContent as any);
    return {
      success: true,
      httpUrl: client.mxcUrlToHttp(uploadRes.content_uri),
    };
  } catch (err) {
    console.error("sendVoiceMessage error:", err);
    return { success: false, err };
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

export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
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
  client: sdk.MatrixClient | null,
  roomId: string,
  isTyping: boolean
): Promise<{ success: boolean; err?: any }> => {
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

export const sendLocationMessage = async (
  client: MatrixClient,
  roomId: string,
  locationInfo: LocationInfo
) => {
  try {
    const { geoUri, displayText } = locationInfo;

    const locationMessage = {
      msgtype: "m.location",
      body: displayText,
      geo_uri: geoUri,
      "org.matrix.msc3488.location": {
        uri: geoUri,
        description: displayText,
      },
      "org.matrix.msc3488.text": displayText,
      "org.matrix.msc1767.text": displayText,
    };
    await client.sendEvent(
      roomId,
      "m.room.message",
      locationMessage as any,
      ""
    );
    return {
      success: true,
    };
  } catch (error) {
    console.error("Send Image Message Error:", error);
    throw error;
  }
};

export const sendVideoMessage = async (
  client: MatrixClient,
  roomId: string,
  file: File
) => {
  try {
    const metadata = await getVideoMetadata(file);
    const uploadResponse = await client.uploadContent(file, {
      type: file.type,
      name: file.name,
    });
    const content = {
      msgtype: "m.video",
      body: file.name,
      info: {
        duration: Math.round(metadata.duration), // milliseconds
        mimetype: file.type,
        size: file.size,
        w: Math.round(metadata.width),
        h: Math.round(metadata.height),
      },
      url: uploadResponse.content_uri,
    };
    await client.sendMessage(roomId, content as any);
    return {
      httpUrl: client.mxcUrlToHttp(uploadResponse.content_uri),
      metadata,
    };
  } catch (error) {
    throw error;
  }
};

export const sendFileMessage = async (
  client: MatrixClient,
  roomId: string,
  file: File
) => {
  try {
    const contentType = file.type;
    const fileName = file.name;
    const fileSize = file.size;
    const buffer = await file.arrayBuffer();

    const uploadResponse = await client.uploadContent(buffer, {
      name: fileName,
      type: contentType,
    });

    // 3. Tạo nội dung tin nhắn
    const content = {
      body: fileName,
      info: {
        size: fileSize,
        mimetype: contentType,
      },
      msgtype: "m.file",
      url: uploadResponse.content_uri,
    };

    // 4. Gửi tin nhắn
    await client.sendMessage(roomId, content as any);

    return {
      httpUrl: client.mxcUrlToHttp(uploadResponse.content_uri),
    }; // chứa event_id, room_id...
  } catch (error) {
    throw error;
  }
};

export const sendSticker = async (
  client: MatrixClient,
  roomId: string,
  stickerUrl: string,
  isStickerAnimation: boolean
) => {
  try {
    const content = {
      msgtype: "m.sticker",
      body: stickerUrl,
      url: stickerUrl,
      info: {
        mimetype: isStickerAnimation ? "video/webp" : "image/webp",
        isStickerAnimation, // tuỳ chọn mở rộng để client biết
      },
    };

    await client.sendMessage(roomId, content as any);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const deleteMessage = async (
  client: MatrixClient,
  roomId: string,
  eventId: string
) => {
  try {
    //console.log(eventId);
    const room = client.getRoom(roomId);
    const event = room?.findEventById(eventId);
    const waitForSendConfirm = (event: MatrixEvent): Promise<void> =>
      new Promise((resolve, reject) => {
        const check = () => {
          if (!event.status) resolve();
          else setTimeout(check, 200);
        };
        check();
      });
    //console.log(event?.getContent().body);
    if (event) await waitForSendConfirm(event);
    const txtId = "mgs_" + Date.now();
    await client.redactEvent(roomId, eventId, txtId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
