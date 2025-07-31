"use client";

import React from "react";
import { X } from "lucide-react";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { cn } from "@/lib/utils";

const SelectionHeader: React.FC = () => {
  const { selectedMessages, isSelectionMode, exitSelectionMode } =
    useSelectionStore();

  if (!isSelectionMode) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-[200]",
        "transform transition-transform duration-300 ease-out",
        isSelectionMode ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Selection Count */}
        <div className="flex items-center gap-3">
          <button
            onClick={exitSelectionMode}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Exit selection mode"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-900">
            {selectedMessages.length} selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectionHeader;
