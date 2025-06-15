"use client"

import * as sdk from 'matrix-js-sdk'

const ContactService = {
  async getDirectMessageRooms(client: sdk.MatrixClient): Promise<sdk.Room[]> {
    // Lấy danh sách roomId từ m.direct
    const directContent = client.getAccountData('m.direct' as keyof sdk.AccountDataEvents)?.getContent() || {};
    const directRoomIds = Object.values(directContent).flat() as string[];

    // Lấy tất cả phòng đã join
    const joinedRooms = client.getRooms().filter(room => room.getMyMembership() === 'join');

    // Lọc các phòng direct: 
    // - Có trong m.direct
    // - Hoặc là phòng 1-1 (chỉ có 2 thành viên đã join, không phải group)
    const directRooms = joinedRooms.filter(room => {
      if (directRoomIds.includes(room.roomId)) return true;
      // Fallback: phòng 1-1
      const members = room.getJoinedMembers();
      return members.length === 2;
    });

    return directRooms;
  },
  
  async addContact(client: sdk.MatrixClient, userId: string): Promise<sdk.Room> {
    if (!userId.startsWith('@')) {
      throw new Error('User ID không hợp lệ. Định dạng đúng là @user:domain')
    }
  
    // Kiểm tra đã có liên hệ chưa
    const existingRoom = client.getRooms().find(room =>
      room.getMyMembership() === 'join' &&
      room.getJoinedMembers().some(m => m.userId === userId)
    )
  
    if (existingRoom) {
      throw new Error('Đã có liên hệ với người dùng này.')
    }
  
    const response = await client.createRoom({
      invite: [userId],
      is_direct: true,
    })
  
    const roomId = response.room_id;

    // Đợi phòng thực sự xuất hiện và trạng thái là 'join'
    return await new Promise<sdk.Room>((resolve, reject) => {
      const maxWait = 5000;
      const interval = 100;
      let waited = 0;

      const checkRoom = () => {
        const room = client.getRoom(roomId);
        if (room && room.getMyMembership() === 'join') {
          resolve(room);
          return true;
        }
        return false;
      };

      // Kiểm tra ngay lập tức
      if (checkRoom()) return;

      // Polling
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

      // Lắng nghe event Room (dự phòng)
      const handler = (room: sdk.Room) => {
        if (room.roomId === roomId && room.getMyMembership() === 'join') {
          clearInterval(poll);
          client.removeListener("Room" as any, handler);
          resolve(room);
        }
      };
      client.on("Room" as any, handler);
    });
  }
}
 
export default ContactService;


