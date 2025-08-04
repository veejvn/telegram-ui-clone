import * as sdk from "matrix-js-sdk";

/**
 * Pin một tin nhắn trong room
 * Matrix sử dụng state event m.room.pinned_events để lưu trữ danh sách các eventId được pin
 */
export const pinMessage = async (
  client: sdk.MatrixClient,
  roomId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const room = client.getRoom(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    // Lấy danh sách tin nhắn đã pin hiện tại
    const currentPinnedEvents = room.currentState.getStateEvents(
      "m.room.pinned_events",
      ""
    );
    const currentPinned = currentPinnedEvents?.getContent()?.pinned || [];

    // Kiểm tra xem eventId đã được pin chưa
    if (currentPinned.includes(eventId)) {
      return { success: false, error: "Message already pinned" };
    }

    // Thêm eventId vào danh sách pin
    const newPinned = [...currentPinned, eventId];

    // Gửi state event để cập nhật danh sách pin
    await client.sendStateEvent(
      roomId,
      "m.room.pinned_events" as any,
      {
        pinned: newPinned,
      },
      ""
    );

    return { success: true };
  } catch (error) {
    console.error("Error pinning message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Unpin một tin nhắn trong room
 */
export const unpinMessage = async (
  client: sdk.MatrixClient,
  roomId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const room = client.getRoom(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    // Lấy danh sách tin nhắn đã pin hiện tại
    const currentPinnedEvents = room.currentState.getStateEvents(
      "m.room.pinned_events",
      ""
    );
    const currentPinned = currentPinnedEvents?.getContent()?.pinned || [];

    // Kiểm tra xem eventId có trong danh sách pin không
    if (!currentPinned.includes(eventId)) {
      return { success: false, error: "Message not pinned" };
    }

    // Loại bỏ eventId khỏi danh sách pin
    const newPinned = currentPinned.filter((id: string) => id !== eventId);

    // Gửi state event để cập nhật danh sách pin
    await client.sendStateEvent(
      roomId,
      "m.room.pinned_events" as any,
      {
        pinned: newPinned,
      },
      ""
    );

    return { success: true };
  } catch (error) {
    console.error("Error unpinning message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Lấy danh sách tin nhắn đã pin trong room
 */
export const getPinnedMessages = async (
  client: sdk.MatrixClient,
  roomId: string
): Promise<{ success: boolean; messages: any[]; error?: string }> => {
  try {
    const room = client.getRoom(roomId);
    if (!room) {
      return { success: false, messages: [], error: "Room not found" };
    }

    // Lấy danh sách eventId đã pin
    const pinnedEvents = room.currentState.getStateEvents(
      "m.room.pinned_events",
      ""
    );
    const pinnedEventIds = pinnedEvents?.getContent()?.pinned || [];

    if (pinnedEventIds.length === 0) {
      return { success: true, messages: [] };
    }

    // Lấy thông tin các tin nhắn từ eventId
    const messages = [];
    for (const eventId of pinnedEventIds) {
      const event = room.findEventById(eventId);
      if (event && event.getType() === "m.room.message") {
        const content = event.getContent();
        const sender = event.getSender() || "Unknown";
        const senderDisplayName = event.sender?.name || sender;
        const timestamp = event.getTs();
        const time = new Date(timestamp).toLocaleString();

        messages.push({
          eventId,
          text: content.body || "",
          sender,
          senderDisplayName,
          time,
          timestamp,
          type: content.msgtype || "m.text",
          roomId,
          pinnedAt: timestamp, // Tạm thời dùng timestamp của tin nhắn
        });
      }
    }

    return { success: true, messages };
  } catch (error) {
    console.error("Error getting pinned messages:", error);
    return {
      success: false,
      messages: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Kiểm tra xem tin nhắn có được pin không
 */
export const isMessagePinned = (
  client: sdk.MatrixClient,
  roomId: string,
  eventId: string
): boolean => {
  try {
    const room = client.getRoom(roomId);
    if (!room) return false;

    const pinnedEvents = room.currentState.getStateEvents(
      "m.room.pinned_events",
      ""
    );
    const pinnedEventIds = pinnedEvents?.getContent()?.pinned || [];

    return pinnedEventIds.includes(eventId);
  } catch (error) {
    console.error("Error checking if message is pinned:", error);
    return false;
  }
};
