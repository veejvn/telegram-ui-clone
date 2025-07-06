'use client';

import { useState, useEffect, useCallback } from 'react';
import { MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';
import { useMatrixClient } from '@/contexts/MatrixClientProvider';

interface ReadReceiptInfo {
  userId: string;
}

interface MessageReadStatus {
    eventId: string;
    isRead: boolean;
    readBy: ReadReceiptInfo[];
    totalMembers: number;
}

export const useReadReceipts = (room: Room) => {
  const [lastReadReceipts, setLastReadReceipts] = useState<boolean>(false);
  const client = useMatrixClient();
  const roomId = room.roomId;

  const scrollback = async (client: MatrixClient) => {
    await client.scrollback(room, 100);
  }
  
  const updateReadReceipts = useCallback(() => {
    if (!client || !room) return;
    
    const userId = client.getUserId();
    scrollback(client);
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();

    // const messages = events.filter((e) => e.getType() === "m.room.message");
    // const messagesOfUser = messages.filter((m) => m.getSender() === userId);
    // const lastMessageOfUser = messagesOfUser[messagesOfUser.length - 1]
    // console.log(lastMessageOfUser);
    // const receipts = room.getReceiptsForEvent(lastMessageOfUser);
    // if (receipts && receipts.length > 0) {
    //   const otherReceipt = receipts.find((r) => r.userId !== userId && r.type === "m.read");
    //   if(otherReceipt) setLastReadReceipts(true);
    // }

    // let lastReadEventId: string | null = null;
    // for (let i = events.length - 1; i >= 0; i--) {
    //   const event = events[i];
    //   if (event.getType() === 'm.room.message') {
    //     // Lấy tất cả read receipts cho event này
    //     const readReceipts = room.getReceiptsForEvent(event);
    //     if (readReceipts && readReceipts.length > 0) {
    //       const otherReceipt = readReceipts.find(
    //         (r) => r.userId !== userId && r.type === "m.read"
    //       );
    //       if (otherReceipt) {
    //         lastReadEventId = event.getId() || null;
    //         break;
    //       }
    //     }
    //   }
    // }

    // let lastReadIndex = -1;
    // if (lastReadEventId) {
    //   lastReadIndex = events.filter((e) => e.getType() === "m.room.message").findIndex((e) => e.getId() === lastReadEventId);
    // }
    // const messages = events.filter((e) => (e.getType() === "m.room.message"))
    // const messageOfUser = messages.filter((e) => e.getSender() === userId);
    // const lastMessageOfUser = messageOfUser[messageOfUser.length - 1];
    // const indexLastMessageOfUser = messages.findIndex((e) => e.getId() === lastMessageOfUser.getId());
    // console.log(indexLastMessageOfUser, lastReadIndex)
    // if(indexLastMessageOfUser === lastReadIndex) setLastReadReceipts(true);
  }, [client, room]);

  useEffect(() => {
    if (!client || !room) return;

    // Cập nhật read receipts ban đầu
    updateReadReceipts();

    // Lắng nghe sự kiện read receipt mới
    const onReceipt = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId) {
        updateReadReceipts();
      }
    };

    // Lắng nghe tin nhắn mới
    const onTimelineEvent = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId && event.getType() === 'm.room.message') {
        updateReadReceipts();
      }
    };

    client.on('Receipt' as any, onReceipt);
    client.on('Room.timeline' as any, onTimelineEvent);

    return () => {
      client.off('Receipt' as any, onReceipt);
      client.off('Room.timeline' as any, onTimelineEvent);
    };
  }, [client, roomId, updateReadReceipts]);

  return lastReadReceipts
};