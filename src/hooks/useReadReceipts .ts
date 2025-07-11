'use client';

import { useState, useEffect, useCallback } from 'react';
import { MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';
import { useMatrixClient } from '@/contexts/MatrixClientProvider';

export const useReadReceipts = (room: Room) => {
  const [lastReadReceipts, setLastReadReceipts] = useState<boolean | null>(false);
  const client = useMatrixClient();
  const roomId = room.roomId;
  
  const updateReadReceipts = useCallback(() => {
    if (!client || !room) return;

    const userId = client.getUserId();
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();

    // 1. Lấy tin nhắn cuối cùng của mình (người nhận)
    const messages = events.filter((e) => e.getType() === "m.room.message");
    const myMessages = messages.filter((m) => m.getSender() === userId);
    if (myMessages.length === 0) {
      setLastReadReceipts(false);
      return;
    }
    const lastMyMessage = myMessages[myMessages.length - 1];

    // 2. Kiểm tra xem người gửi đã đọc tin nhắn này chưa
    // Giả sử bạn biết userId của người gửi là `otherUserId`
    // Nếu là 1-1 chat, bạn có thể lấy từ room.getJoinedMembers()
    const otherMembers = room.getJoinedMembers().filter(m => m.userId !== userId);
    const otherUserId = otherMembers[0]?.userId;
    const usersReadUpTo = room.getUsersReadUpTo(lastMyMessage);
    const hasOtherRead = otherUserId ? usersReadUpTo.includes(otherUserId) : false;
    //console.log(usersReadUpTo, hasOtherRead);

    setLastReadReceipts(hasOtherRead);
  }, [client, room]);

  useEffect(() => {
    if (!client || !room) return;

    // Cập nhật read receipts ban đầu
    updateReadReceipts();

    const onRoomReceipt = (event: MatrixEvent, room: Room) => {
      if (room.roomId === roomId) {
        updateReadReceipts();
      }
    };

    room.on('Room.receipt' as any, onRoomReceipt);

    return () => {
      room.off('Room.receipt' as any, onRoomReceipt);
    };
  }, [client, roomId, updateReadReceipts]);

  return lastReadReceipts
};