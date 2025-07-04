"user client"

import * as sdk from "matrix-js-sdk";

export interface RoomInfo {
  roomId: string;
  type: 'direct' | 'group';
  memberCount: number;
  otherUserId?: string; // Chỉ có với phòng direct
  name: string;
  avatar?: string;
}

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export function getRoomInfo(room: sdk.Room, currentUserId: string | null): RoomInfo {
  const members = room.getJoinedMembers();
  const memberCount = members.length;
  
  // Phòng direct: chỉ có 2 người và được đánh dấu là direct
  const isDirect = memberCount === 2 && !!currentUserId;
  
  let otherUserId: string | undefined;
  let roomName = room.name;
  let roomAvatar = room.getAvatarUrl(
    HOMESERVER_URL,
    96,
    96,
    'crop',
    true
  );

  if (isDirect) {
    // Tìm user khác trong phòng direct
    otherUserId = members.find(member => member.userId !== currentUserId)?.userId;
    
    // Nếu phòng direct không có tên, dùng tên của user kia
    if (!roomName && otherUserId) {
      const otherMember = room.getMember(otherUserId);
      roomName = otherMember?.name || otherUserId;
      const otherAvatar = otherMember?.getAvatarUrl(HOMESERVER_URL, 96, 96, 'crop', true, true) ?? null;
      roomAvatar = roomAvatar ?? otherAvatar;
    }
  }

  return {
    roomId: room.roomId,
    type: isDirect ? 'direct' : 'group',
    memberCount,
    otherUserId,
    name: roomName || 'Unnamed Room',
    avatar: roomAvatar ?? undefined
  };
}

export function getActiveMembers(room: sdk.Room, userPresences: Map<string, any>): sdk.RoomMember[] {
  return room.getJoinedMembers().filter(member => {
    const presence = userPresences.get(member.userId);
    return presence?.presence === 'online';
  });
}