"use client";

import React from "react";
import { Trash2, Forward } from "lucide-react";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { cn } from "@/lib/utils";

interface BottomActionBarProps {
  onDelete: (messageIds: string[]) => void;
  onForward: (messageIds: string[]) => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onDelete,
  onForward,
}) => {
  const { selectedMessages, isSelectionMode } = useSelectionStore();

  // Chỉ ẩn khi không ở selection mode, không quan tâm số lượng tin nhắn được chọn
  if (!isSelectionMode) {
    return null;
  }

  const handleDelete = () => {
    if (selectedMessages.length > 0) {
      onDelete(selectedMessages);
    }
  };

  const handleForward = () => {
    if (selectedMessages.length > 0) {
      onForward(selectedMessages);
    }
  };

  const hasSelectedMessages = selectedMessages.length > 0;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#FFFFFF4D] shadow-custom-deep backdrop-blur-[48px] p-4 h-[90px] z-[200] rounded-t-3xl",
        "transform transition-transform duration-300 ease-out",
        isSelectionMode ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-between items-center max-w-md mx-auto">
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={!hasSelectedMessages}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
            hasSelectedMessages
              ? "bg-white text-red-500 active:bg-white/80"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          <Trash2 size={16} />
          <span className="font-medium text-sm">
            Delete({selectedMessages.length})
          </span>
        </button>

        {/* Forward Button */}
        <button
          onClick={handleForward}
          disabled={!hasSelectedMessages}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
            hasSelectedMessages
              ? "bg-white text-blue-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          <span className="font-medium text-sm">Forward</span>
          <Forward size={16} />
        </button>
      </div>
    </div>
  );
};

export default BottomActionBar;
