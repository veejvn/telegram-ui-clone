"use client";

import * as sdk from "matrix-js-sdk";

const ContactService = {
  async getDirectMessageRooms(client: sdk.MatrixClient): Promise<sdk.Room[]> {
    const directContent =
      client
        .getAccountData("m.direct" as keyof sdk.AccountDataEvents)
        ?.getContent() || {};
    const directRoomIds = Object.values(directContent).flat() as string[];

    const joinedRooms = client
      .getRooms()
      .filter((room) => room.getMyMembership() === "join");

    const directRooms = joinedRooms.filter((room) => {
      if (directRoomIds.includes(room.roomId)) return true;
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

    // ✅ Kiểm tra tất cả các phòng đã có với user này (kể cả họ chưa join)
    const existingRoom = client.getRooms().find((room) => {
      const isDM =
        typeof (room as any).getIsDirect === "function"
          ? (room as any).getIsDirect()
          : room.getJoinedMembers().length <= 2;

      const hasUser = room.getMembers().some((m) => m.userId === userId);
      const myMembership = room.getMyMembership();

      return (
        isDM &&
        hasUser &&
        (myMembership === "join" || myMembership === "invite")
      );
    });

    if (existingRoom) {
      return existingRoom;
    }

    // ❗Nếu chưa có phòng nào, mới tạo mới
    const response = await client.createRoom({
      invite: [userId],
      is_direct: true,
    });

    const roomId = response.room_id;

    return await new Promise<sdk.Room>((resolve, reject) => {
      const maxWait = 5000;
      const interval = 100;
      let waited = 0;

      const checkRoom = () => {
        const room = client.getRoom(roomId);
        if (room && room.getMyMembership() === "join") {
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
          reject(new Error("Không thể lấy thông tin phòng vừa tạo."));
        }
      }, interval);

      const handler = (room: sdk.Room) => {
        if (room.roomId === roomId && room.getMyMembership() === "join") {
          clearInterval(poll);
          client.removeListener("Room" as any, handler);
          resolve(room);
        }
      };
      client.on("Room" as any, handler);
    });
  },
};

export default ContactService;
