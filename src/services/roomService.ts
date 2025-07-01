/* eslint-disable @typescript-eslint/no-explicit-any */
import * as sdk from "matrix-js-sdk";

export async function createPublicRoom(
  roomName: string,
  client: sdk.MatrixClient,
  avatarFile?: File,
  invitees?: string[]
): Promise<{ roomId: string } | { error: string }> {
  try {
    if (!client) throw new Error("Matrix client not initialized");

    //  Tạo phòng
    const res = await client.createRoom({
      name: roomName,
      invite: invitees?.length ? invitees : undefined,
      visibility: "public" as sdk.Visibility,
    });

    const roomId = res.room_id;

    // Đợi room được fully emit
    await waitUntilRoomSynced(client, roomId);

    //  Nếu có ảnh đại diện, upload
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
    }, 4000); // tăng timeout nếu cần

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
