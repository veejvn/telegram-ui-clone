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
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[200]",
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
            "flex items-center gap-2 px-6 py-3 rounded-full transition-colors",
            hasSelectedMessages
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          <Trash2 size={18} />
          <span className="font-medium">
            Delete ({selectedMessages.length})
          </span>
        </button>

        {/* Forward Button */}
        <button
          onClick={handleForward}
          disabled={!hasSelectedMessages}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full transition-colors",
            hasSelectedMessages
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          <span className="font-medium">Forward</span>
          <Forward size={18} />
        </button>
      </div>
    </div>
  );
};

export default BottomActionBar;
