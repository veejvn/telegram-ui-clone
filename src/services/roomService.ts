/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import * as sdk from "matrix-js-sdk";
import { MatrixClient } from "@/lib/matrix-sdk"
export async function createPublicRoom(
  roomName: string,
  client: sdk.MatrixClient,
  avatarFile?: File,
  invitees?: string[]
): Promise<{ roomId: string } | { error: string }> {
  try {
    if (!client) throw new Error("Matrix client not initialized");

    const res = await client.createRoom({
      name: roomName,
      visibility: "public" as sdk.Visibility,
    });

    const roomId = res.room_id;

    await waitUntilRoomSynced(client, roomId);

    if (avatarFile) {
      const mxcUrl = await client.uploadContent(avatarFile, {
        name: avatarFile.name,
        type: avatarFile.type,
      });

      await client.sendStateEvent(
        roomId,
        "m.room.avatar" as any,
        { url: mxcUrl },
        ""
      );
    }

    if (invitees?.length) {
      for (const userId of invitees) {
        try {
          await client.invite(roomId, userId);
        } catch (inviteErr: any) {
          console.warn(`❌ Failed to invite ${userId}:`, inviteErr?.message);
        }
      }
    }

    return { roomId };
  } catch (err: any) {
    return { error: err.message || "Failed to create room" };
  }
}

function waitUntilRoomSynced(
  client: sdk.MatrixClient,
  roomId: string
): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      client.removeListener("Room" as any, handler);
      resolve(); // fallback nếu chờ quá lâu
    }, 4000);

    const handler = (room: sdk.Room) => {
      if (room.roomId === roomId) {
        clearTimeout(timeout);
        client.removeListener("Room" as any, handler);
        resolve();
      }
    };

    client.on("Room" as any, handler);
  });
}

const userIdChatBot = process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev"

export function hasRoomWithChatBot(client: MatrixClient) {
  if (!client) return false;
  
  // Kiểm tra sync state
  const syncState = client.getSyncState();
  if (!syncState || syncState === "STOPPED" || syncState === "ERROR") {
    console.log("Client chưa sync xong, không thể kiểm tra chat bot");
    return false;
  }
  
  const userId = client.getUserId();
  if (!userId) return false;
  
  const rooms = client.getRooms();
  for (const room of rooms) {
    if (room.getMyMembership() !== "join") continue;
    // Kiểm tra có bot là thành viên (dù là joined, invited, v.v.)
    const allMembers = room.getMembers();
    //console.log("Room:", room.roomId, "members:", allMembers.map(m => m.userId));
    const botMember = allMembers.find(m => m.userId === userIdChatBot);
    if (botMember) {
      //console.log("Bot found in room", room.roomId, "membership:", botMember.membership);
      return true;
    }
  }
  return false;
}

export async function addChatBot(client: MatrixClient) {
  if (!client) {
    throw new Error("Không có client");
  }
  
  // Kiểm tra sync state trước khi tạo room
  const syncState = client.getSyncState();
  if (!syncState || syncState === "STOPPED" || syncState === "ERROR") {
    throw new Error("Client chưa sẵn sàng, không thể tạo room");
  }
  
  try {
    const response = await client.createRoom({
      name: "Assistant",
      invite: [userIdChatBot],
      is_direct: true,
    });
    
    const roomId = response.room_id;
    //console.log("Đã tạo room với chat bot:", roomId);

    return await new Promise<sdk.Room>((resolve, reject) => {
      const maxWait = 10000; // Tăng thời gian chờ
      const interval = 100;
      let waited = 0;

      const checkRoom = () => {
        const room = client.getRoom(roomId);
        if (room && room.getMyMembership() === "join") {
          //console.log("Room đã sẵn sàng:", roomId);
          resolve(room);
          return true;
        }
        return false;
      };

      if (checkRoom()) return;

      const poll = setInterval(() => {
        waited += interval;
        if (checkRoom()) {
          clearInterval(poll);
          return;
        }
        if (waited >= maxWait) {
          clearInterval(poll);
          reject(new Error("Timeout: Không thể lấy thông tin phòng vừa tạo sau 10 giây"));
        }
      }, interval);

      const handler = (room: sdk.Room) => {
        if (room.roomId === roomId && room.getMyMembership() === "join") {
          clearInterval(poll);
          client.removeListener("Room" as any, handler);
          console.log("Room event received:", roomId);
          resolve(room);
        }
      };
      
      client.on("Room" as any, handler);
    });
  } catch (error) {
    console.error("Lỗi khi tạo room với chat bot:", error);
    throw error;
  }
}