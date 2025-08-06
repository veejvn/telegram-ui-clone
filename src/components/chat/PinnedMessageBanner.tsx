"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Pin, X } from "lucide-react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { usePinStore, PinnedMessage } from "@/stores/usePinStore";
import { unpinMessage } from "@/services/pinService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PinnedMessagesList from "./PinnedMessagesList";
import { RiPushpinFill } from "react-icons/ri";

interface PinnedMessageBannerProps {
  roomId: string;
}

const PinnedMessageBanner: React.FC<PinnedMessageBannerProps> = ({
  roomId,
}) => {
  const client = useMatrixClient();
  const router = useRouter();
  const {
    getLatestPinnedMessage,
    getPinnedMessages,
    unpinMessage: unpinFromStore,
  } = usePinStore();

  // Use direct store subscriptions for reactive updates
  const pinnedMessages = usePinStore(
    (state) => state.pinnedMessagesByRoom[roomId] || []
  );
  const pinnedMessage = pinnedMessages.length > 0 ? pinnedMessages[0] : null;
  const totalPinnedCount = pinnedMessages.length;
  const isVisible = pinnedMessage !== null;

  const [showPinnedList, setShowPinnedList] = useState(false);

  const handleUnpin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client || !pinnedMessage) return;

    try {
      const result = await unpinMessage(client, roomId, pinnedMessage.eventId);
      if (result.success) {
        unpinFromStore(roomId, pinnedMessage.eventId);
      } else {
        console.error("Failed to unpin message:", result.error);
        //toast.error(result.error || "Failed to unpin message");
      }
    } catch (error) {
      console.error("Error unpinning message:", error);
      //toast.error("Failed to unpin message");
    }
  };

  const handleBannerClick = () => {
    if (!pinnedMessage) return;
    // Always navigate to the pinned message when clicking the banner
    router.push(`/chat/${roomId}?highlight=${pinnedMessage.eventId}`);

    // Force scroll and highlight after navigation, even if URL doesn't change
    setTimeout(() => {
      const targetElement = document.querySelector(
        `[data-message-id="${pinnedMessage.eventId}"]`
      );
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Trigger manual highlight animation
        window.dispatchEvent(
          new CustomEvent("manualHighlight", {
            detail: { eventId: pinnedMessage.eventId },
          })
        );
      }
    }, 100);
  };

  const handleShowList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalPinnedCount > 1) {
      setShowPinnedList(true);
    }
  };

  if (!isVisible || !pinnedMessage) {
    return null;
  }

  // Truncate long text
  const truncatedText =
    pinnedMessage.text.length > 50
      ? pinnedMessage.text.substring(0, 50) + "..."
      : pinnedMessage.text;

  return (
    <>
      {isVisible && pinnedMessage && (
        <div className="bg-[#FFFFFF4D] mx-6 mt-5 backdrop-blur-[24px] relative rounded-full border border-[#DDDDDD]">
          <div
            className="px-4 py-3 cursor-pointer transition-colors"
            onClick={handleBannerClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <RiPushpinFill
                  size={16}
                  className="text-[#1976D2] dark:text-blue-400 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#6B7271] font-normal mb-1">
                    Pinned message
                  </div>
                  <div className="text-[12px] text-[#121212] dark:text-gray-200 truncate font-normal">
                    {truncatedText}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalPinnedCount > 1 && (
                  <div
                    className="bg-[#8080804D] text-[#121212] text-[12px] px-2 py-1 rounded-full cursor-pointer hover:bg-[#80808066] transition-colors flex items-center justify-center min-w-[28px] h-[24px]"
                    onClick={handleShowList}
                    title="Show all pinned messages"
                  >
                    +{totalPinnedCount - 1}
                    <ChevronDown className="size-4" />
                  </div>
                )}
                {totalPinnedCount === 1 && (
                  <button
                    onClick={handleUnpin}
                    className="p-1.5 size-9 bg-[#8080804D] rounded-full transition-colors flex-shrink-0 flex items-center justify-center hover:bg-[#BBDEFB] dark:hover:bg-blue-800"
                    title="Unpin message"
                  >
                    <X size={16} className="text-[#121212]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Messages List Modal */}
      {showPinnedList && (
        <PinnedMessagesList
          roomId={roomId}
          onClose={() => setShowPinnedList(false)}
        />
      )}
    </>
  );
};

export default PinnedMessageBanner;
