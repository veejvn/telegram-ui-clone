"use client";

import React, { useEffect, useState } from "react";
import { Pin, ArrowLeft, X } from "lucide-react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { usePinStore, PinnedMessage } from "@/stores/usePinStore";
import { unpinMessage, getPinnedMessages } from "@/services/pinService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

interface PinnedMessagesListProps {
  roomId: string;
  onClose: () => void;
}

const PinnedMessagesList: React.FC<PinnedMessagesListProps> = ({
  roomId,
  onClose,
}) => {
  const client = useMatrixClient();
  const router = useRouter();
  const { getPinnedMessages: getLocalPinned, unpinMessage: unpinFromStore } =
    usePinStore();
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPinnedMessages();
  }, [roomId]);

  const loadPinnedMessages = async () => {
    setLoading(true);
    try {
      if (client) {
        // Try to get from server first
        const result = await getPinnedMessages(client, roomId);
        if (result.success) {
          setPinnedMessages(result.messages);
        } else {
          // Fallback to local store
          setPinnedMessages(getLocalPinned(roomId));
        }
      } else {
        // Use local store if no client
        setPinnedMessages(getLocalPinned(roomId));
      }
    } catch (error) {
      console.error("Error loading pinned messages:", error);
      setPinnedMessages(getLocalPinned(roomId));
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (message: PinnedMessage) => {
    if (!client) return;

    try {
      const result = await unpinMessage(client, roomId, message.eventId);
      if (result.success) {
        unpinFromStore(roomId, message.eventId);
        setPinnedMessages((prev) =>
          prev.filter((m) => m.eventId !== message.eventId)
        );
        //toast.success("Message unpinned");
      } else {
        console.error("Failed to unpin message:", result.error);
        //toast.error(result.error || "Failed to unpin message");
      }
      if (pinnedMessages.length === 1) {
        onClose(); // Close the banner if this was the last pinned message
      }
    } catch (error) {
      console.error("Error unpinning message:", error);
      //toast.error("Failed to unpin message");
    }
  };

  const handleMessageClick = (message: PinnedMessage) => {
    onClose();
    router.push(`/chat/${roomId}?highlight=${message.eventId}`);
    // Force scroll and highlight after navigation, even if URL doesn't change
    setTimeout(() => {
      const targetElement = document.querySelector(
        `[data-message-id="${message.eventId}"]`
      );
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Trigger manual highlight animation
        window.dispatchEvent(
          new CustomEvent("manualHighlight", {
            detail: { eventId: message.eventId },
          })
        );
      }
    }, 100);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Close"
            aria-label="Close pinned messages list"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pin size={18} className="text-blue-500" />
            Pinned Messages
          </h2>
          <div className="w-8" /> {/* Spacer for center alignment */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading pinned messages...
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Pin size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No pinned messages yet</p>
              <p className="text-sm mt-2">
                Long press on a message and select "Pin" to pin it
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pinnedMessages.map((message) => (
                <div
                  key={message.eventId}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {message.senderDisplayName || message.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMsgTime(message.time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3">
                        {truncateText(message.text)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpin(message);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="Unpin message"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        {pinnedMessages.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-center">
            {pinnedMessages.length} pinned message
            {pinnedMessages.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinnedMessagesList;
