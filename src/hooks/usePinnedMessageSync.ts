import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { usePinStore } from "@/stores/usePinStore";
import { getPinnedMessages } from "@/services/pinService";
import * as sdk from "matrix-js-sdk";

/**
 * Hook để đồng bộ pinned messages với Matrix server
 * Lắng nghe state events m.room.pinned_events và cập nhật local store
 */
export const usePinnedMessageSync = (roomId: string) => {
  const client = useMatrixClient();
  const {
    pinMessage,
    unpinMessage: unpinFromStore,
    clearPinnedMessages,
  } = usePinStore();

  useEffect(() => {
    if (!client || !roomId) return;

    // Sync initial pinned messages
    const syncPinnedMessages = async () => {
      try {
        const result = await getPinnedMessages(client, roomId);
        if (result.success) {
          // Clear existing pinned messages for this room
          clearPinnedMessages(roomId);

          // Add all pinned messages to store
          result.messages.forEach((message) => {
            pinMessage(roomId, message);
          });
        }
      } catch (error) {
        console.error("Error syncing pinned messages:", error);
      }
    };

    // Initial sync
    syncPinnedMessages();

    // Listen for pinned events changes
    const onRoomStateEvent = (event: sdk.MatrixEvent) => {
      if (
        event.getType() === "m.room.pinned_events" &&
        event.getRoomId() === roomId
      ) {
        // Re-sync when pinned events change
        syncPinnedMessages();
      }
    };

    client.on("RoomState.events" as any, onRoomStateEvent);

    // Cleanup
    return () => {
      client.removeListener("RoomState.events" as any, onRoomStateEvent);
    };
  }, [client, roomId, pinMessage, unpinFromStore, clearPinnedMessages]);
};
