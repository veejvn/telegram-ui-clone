"use client";

import * as sdk from "matrix-js-sdk";

const ContactService = {
  async getDirectMessageRooms(client: sdk.MatrixClient): Promise<sdk.Room[]> {
    // Lấy danh sách roomId từ m.direct
    const directContent =
      client
        .getAccountData("m.direct" as keyof sdk.AccountDataEvents)
        ?.getContent() || {};
    const directRoomIds = Object.values(directContent).flat() as string[];

    // Lấy tất cả phòng đã join
    const joinedRooms = client
      .getRooms()
      .filter((room) => room.getMyMembership() === "join");

    // Lọc các phòng direct:
    // - Có trong m.direct
    // - Hoặc là phòng 1-1 (chỉ có 2 thành viên đã join, không phải group)
    const directRooms = joinedRooms.filter((room) => {
      if (directRoomIds.includes(room.roomId)) return true;
      // Fallback: phòng 1-1
      const members = room.getJoinedMembers();
      return members.length === 2;
    });

    return directRooms;
  },

  async addContact(
    client: sdk.MatrixClient,
    userId: string
  ): Promise<sdk.Room> {
    if (!userId.startsWith("@")) {
      throw new Error("User ID không hợp lệ. Định dạng đúng là @user:domain");
    }

    // Kiểm tra đã có liên hệ chưa
    const existingRoom = client
      .getRooms()
      .find(
        (room) =>
          room.getMyMembership() === "join" &&
          room.getJoinedMembers().some((m) => m.userId === userId)
      );

    if (existingRoom) {
      console.log("[ContactService] Đã có phòng với người dùng này.");
      return existingRoom;
    }

    // 🔹 BẮT ĐẦU ĐO THỜI GIAN CHUNG (cả createRoom + đợi phòng xuất hiện)
    console.time(
      `[ContactService] Tổng thời gian tạo & sync phòng với ${userId}`
    );

    // 🔹 ĐO RIÊNG thời gian gọi API createRoom
    console.time(`[ContactService] Thời gian gọi createRoom`);

    const response = await client.createRoom({
      invite: [userId],
      is_direct: true,
    });

    console.timeEnd(`[ContactService] Thời gian gọi createRoom`);
    const roomId = response.room_id;

    // Đợi phòng thực sự xuất hiện và đã join
    return await new Promise<sdk.Room>((resolve, reject) => {
      const maxWait = 5000;
      const interval = 100;
      let waited = 0;

      const checkRoom = () => {
        const room = client.getRoom(roomId);
        if (room && room.getMyMembership() === "join") {
          console.timeEnd(
            `[ContactService] Tổng thời gian tạo & sync phòng với ${userId}`
          );
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
          console.timeEnd(
            `[ContactService] Tổng thời gian tạo & sync phòng với ${userId}`
          );
          reject(new Error("Không thể lấy thông tin phòng vừa tạo."));
        }
      }, interval);

      const handler = (room: sdk.Room) => {
        if (room.roomId === roomId && room.getMyMembership() === "join") {
          clearInterval(poll);
          client.removeListener("Room" as any, handler);
          console.timeEnd(
            `[ContactService] Tổng thời gian tạo & sync phòng với ${userId}`
          );
          resolve(room);
        }
      };
      client.on("Room" as any, handler);
    });
  },
};

export default ContactService;
