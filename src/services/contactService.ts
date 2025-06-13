"use client"

import * as sdk from 'matrix-js-sdk'

const ContactService = {
  async getDirectMessageRooms(client: sdk.MatrixClient) : Promise<sdk.Room[]> {
    return client.getRooms().filter(room =>
      room.getMyMembership() === 'join' &&
      room.getJoinedMembers().length === 2
    )
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
  
    const room = client.getRoom(response.room_id)
    if (!room) {
      throw new Error('Không thể lấy thông tin phòng vừa tạo.')
    }
  
    return room
  }
}
 
export default ContactService;


