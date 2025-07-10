'use client';

import { useState, useEffect, useCallback } from 'react';
import { MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';
import { useMatrixClient } from '@/contexts/MatrixClientProvider';

export const useReadReceipts = (room: Room) => {
  const [lastReadReceipts, setLastReadReceipts] = useState<boolean>(false);
  const client = useMatrixClient();
  const roomId = room.roomId;
  
  const updateReadReceipts = useCallback(() => {
    if (!client || !room) return;

    const userId = client.getUserId();
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();

    // 1. Lấy tin nhắn cuối cùng bạn gửi
    const messages = events.filter((e) => e.getType() === "m.room.message");
    const myMessages = messages.filter((m) => m.getSender() === userId);
    const lastMyMessage = myMessages[myMessages.length - 1];
    //console.log(lastMyMessage.getContent())
    if (!lastMyMessage) {
      setLastReadReceipts(false);
      return;
    }

    const usersReadUpTo = room.getUsersReadUpTo(lastMyMessage);
    const hasOtherRead = usersReadUpTo.some(uid => uid !== userId);
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