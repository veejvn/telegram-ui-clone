import { useRef, useState, useEffect, useCallback } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { addChatBot, hasRoomWithChatBot } from "@/services/roomService";
import useSortedRooms from "@/hooks/useSortedRooms";

const READY_STATES = ["PREPARED", "SYNCED", "SYNCING"]; // Tùy SDK, có thể chỉ cần "SYNCED" hoặc "PREPARED"

export function useChatBot() {
  const client = useMatrixClient();
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [hasChatBot, setHasChatBot] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<string | null>(null);
  const hasCheckedRef = useRef(false);
  const { refreshRooms } = useSortedRooms();

  // Theo dõi trạng thái sync
  useEffect(() => {
    if (!client) return;
    const state = client.getSyncState?.() ?? null;
    setSyncState(state);
    // console.log("Matrix sync state:", state);

    const handler = (state: string) => {
      setSyncState(state);
      // console.log("Matrix sync state changed:", state);
    };
    client.on?.("sync" as any, handler);
    return () => { client.off?.("sync" as any, handler); };
  }, [client]);

  const checkChatBot = useCallback(() => {
    if (!client) return false;
    if (syncState !== "SYNCING") return false; // Chỉ cho phép khi SYNCING
    return hasRoomWithChatBot(client);
  }, [client, syncState]);

  const addChatBotIfNeeded = useCallback(async () => {
    if (!client || isAddingBot || hasCheckedRef.current || syncState !== "SYNCING") return;

    try {
      setError(null);
      setIsAddingBot(true);

      const hasBot = checkChatBot();
      console.log(hasBot);
      setHasChatBot(hasBot);

      if (!hasBot) {
        await addChatBot(client);
        setHasChatBot(true);
        refreshRooms?.();
      }
      hasCheckedRef.current = true; // Đánh dấu đã kiểm tra/tạo bot
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      setHasChatBot(false);
      hasCheckedRef.current = true; // Đánh dấu đã thử (dù lỗi)
    } finally {
      setIsAddingBot(false);
    }
  }, [client, isAddingBot, checkChatBot, syncState, refreshRooms]);

  // Chỉ gọi khi client đã SYNCING và chưa từng kiểm tra/tạo bot
  useEffect(() => {
    if (client && syncState === "SYNCING" && !hasCheckedRef.current) {
      const timer = setTimeout(() => {
        addChatBotIfNeeded();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [client, syncState, addChatBotIfNeeded]);

  return {
    hasChatBot,
    isAddingBot,
    error,
    addChatBotIfNeeded,
    checkChatBot,
    syncState,
  };
} 