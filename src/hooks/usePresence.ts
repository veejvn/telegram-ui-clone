"use client"

import * as sdk from "matrix-js-sdk";
import { useCallback, useEffect, useState } from "react";

export interface UserPresence {
  userId: string;
  presence: 'online' | 'offline' | 'unavailable';
  lastActiveTs?: number;
  statusMsg?: string;
  currentlyActive?: boolean;
}

export interface UseMatrixPresenceReturn {
  userPresences: Map<string, UserPresence>;
  setPresence: (presence: 'online' | 'offline' | 'unavailable', statusMsg?: string) => Promise<void>;
  getUserPresence: (userId: string) => UserPresence | null;
  isUserOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => Date | null;
}

export function usePresence(client: sdk.MatrixClient | null): UseMatrixPresenceReturn {
  const [userPresences, setUserPresences] = useState<Map<string, UserPresence>>(new Map());

  // Cập nhật presence của user
  const updateUserPresence = useCallback((userId: string, presenceEvent: sdk.MatrixEvent) => {
    const content = presenceEvent.getContent();
    const presence: UserPresence = {
      userId,
      presence: content.presence || 'offline',
      lastActiveTs: content.last_active_ago ? Date.now() - content.last_active_ago : undefined,
      statusMsg: content.status_msg,
      currentlyActive: content.currently_active
    };

    setUserPresences(prev => new Map(prev.set(userId, presence)));
  }, []);

  // Set presence cho chính user hiện tại
  const setPresence = useCallback(async (
    presence: 'online' | 'offline' | 'unavailable',
    statusMsg?: string
  ) => {
    if (!client) return;

    try {
      await client.setPresence({
        presence,
        status_msg: statusMsg
      });
    } catch (error) {
      console.error('Failed to set presence:', error);
      throw error;
    }
  }, [client]);

  // Lấy presence của một user cụ thể
  const getUserPresence = useCallback((userId: string): UserPresence | null => {
    return userPresences.get(userId) || null;
  }, [userPresences]);

  // Kiểm tra user có online không
  const isUserOnline = useCallback((userId: string): boolean => {
    const presence = userPresences.get(userId);
    return presence?.presence === 'online' || false;
  }, [userPresences]);

  // Lấy thời gian last seen
  const getLastSeen = useCallback((userId: string): Date | null => {
    const presence = userPresences.get(userId);
    return presence?.lastActiveTs ? new Date(presence.lastActiveTs) : null;
  }, [userPresences]);

  useEffect(() => {
    if (!client) return;

    // Listener cho presence events
    const onPresence = (event: sdk.MatrixEvent, member: any) => {
      if (event.getType() === sdk.EventType.Presence) {
        updateUserPresence(event.getSender()!, event);
      }
    };

    // Listener cho user activity
    const onUserActivity = (event: sdk.MatrixEvent) => {
      if (event.getSender()) {
        // Cập nhật last active time khi user có hoạt động
        setUserPresences(prev => {
          const current = prev.get(event.getSender()!) || {
            userId: event.getSender()!,
            presence: 'online' as const
          };
          return new Map(prev.set(event.getSender()!, {
            ...current,
            lastActiveTs: Date.now(),
            currentlyActive: true
          }));
        });
      }
    };

    // Đăng ký event listeners
    client.on('User.presence' as any, onPresence);
    client.on('Event.decrypted' as any, onUserActivity);
    client.on('Room.timeline' as any, onUserActivity);

    // Lấy presence ban đầu cho tất cả users trong các rooms
    const initializePresences = async () => {
      const rooms = client.getRooms();
      const userIds = new Set<string>();

      // Collect all user IDs from rooms
      rooms.forEach(room => {
        room.getMembers().forEach(member => {
          userIds.add(member.userId);
        });
      });

      // Get presence for each user
      for (const userId of userIds) {
        try {
          const presence = await client.getPresence(userId);
          if (presence) {
            const presenceData: UserPresence = {
              userId,
              presence: presence.presence || 'offline',
              lastActiveTs: presence.last_active_ago ? Date.now() - presence.last_active_ago : undefined,
              statusMsg: presence.status_msg,
              currentlyActive: presence.currently_active
            };
            setUserPresences(prev => new Map(prev.set(userId, presenceData)));
          }
        } catch (error) {
          // Some users might not have presence data
          console.debug(`Could not get presence for ${userId}:`, error);
        }
      }
    };

    // Initialize presences when client is ready
    if (client.isInitialSyncComplete()) {
      initializePresences();
    } else {
      client.once('sync' as any, () => {
        initializePresences();
      });
    }

    // Cleanup
    return () => {
      client.off('User.presence' as any, onPresence);
      client.off('Event.decrypted' as any, onUserActivity);
      client.off('Room.timeline' as any, onUserActivity);
    };
  }, [client, updateUserPresence]);
  // Auto-update presence khi tab becomes visible/hidden
  useEffect(() => {
    if (!client) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab bị ẩn, set unavailable sau 5 phút
        setTimeout(() => {
          if (document.hidden) {
            setPresence('unavailable').catch(console.error);
          }
        }, 5 * 60 * 1000);
      } else {
        // Tab được focus lại, set online
        setPresence('online').catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [client, setPresence]);

  return {
    userPresences,
    setPresence,
    getUserPresence,
    isUserOnline,
    getLastSeen
  };
}