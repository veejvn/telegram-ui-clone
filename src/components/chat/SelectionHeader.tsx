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
        "fixed top-0 left-0 right-0 px-4 py-3 z-[200]",
        "backdrop-blur-3xl",
        "transform transition-transform duration-300 ease-out",
        isSelectionMode ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Back Button */}
        <div className="size-9"></div>

        {/* Selection Count */}
        <span className="text-[16px] font-semibold tracking-normal leading-[140%] text-[#121212]">
          {selectedMessages.length} selected
        </span>

        {/* Close Button */}
        <button
          onClick={exitSelectionMode}
          className="p-2 hover:bg-blue-200 rounded-full border transition-colors"
          aria-label="Close selection"
        >
          <X size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default SelectionHeader;
