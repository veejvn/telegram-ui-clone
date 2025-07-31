"use client";

import React from "react";
import { useSelectionStore } from "@/stores/useSelectionStore";
import BottomActionBar from "./BottomActionBar";
import SelectionHeader from "./SelectionHeader";
import { deleteMessage } from "@/services/chatService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import { useForwardStore } from "@/stores/useForwardStore";
import { useChatStore } from "@/stores/useChatStore";

interface ChatLayoutProps {
  children: React.ReactNode;
  roomId?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, roomId }) => {
  const client = useMatrixClient();
  const router = useRouter();
  const { exitSelectionMode } = useSelectionStore();
  const { addMessage } = useForwardStore.getState();
  const updateMessage = useChatStore.getState().updateMessage;

  const handleDelete = async (messageIds: string[]) => {
    if (!client || !roomId) return;

    try {
      // Delete each message
      for (const messageId of messageIds) {
        updateMessage(roomId, messageId, { text: "Tin nhắn đã thu hồi" });
        await deleteMessage(client, roomId, messageId);
      }

      // Exit selection mode after deletion
      exitSelectionMode();

      console.log(`Deleted ${messageIds.length} messages successfully`);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const handleForward = async (messageIds: string[]) => {
    if (!client) return;

    try {
      // Get message data from chat store
      const { messagesByRoom } = useChatStore.getState();
      const messages = messagesByRoom[roomId || ""] || [];

      // Filter selected messages
      const selectedMessages = messages.filter((msg) =>
        messageIds.includes(msg.eventId)
      );

      // Navigate to forward screen
      router.push("/chat/forward");

      // Add messages to forward store
      setTimeout(() => {
        selectedMessages.forEach((msg) => {
          addMessage({
            text: msg.text || "",
            senderId: msg.sender || "",
            sender: msg.senderDisplayName || "Unknown",
            time: msg.time || new Date().toISOString(),
          });
        });
      }, 1000);

      // Exit selection mode after forwarding
      exitSelectionMode();
    } catch (error) {
      console.error("Error forwarding messages:", error);
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Selection Header - fixed at top */}
      <SelectionHeader />

      {/* Main content - adjust padding based on selection mode */}
      <div className="h-full">{children}</div>

      {/* Bottom Action Bar - fixed at bottom */}
      <BottomActionBar onDelete={handleDelete} onForward={handleForward} />
    </div>
  );
};

export default ChatLayout;
