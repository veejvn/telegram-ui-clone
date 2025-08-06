"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import * as sdk from "matrix-js-sdk";

interface GroupNameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
}

const GroupNameEditModal = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}: GroupNameEditModalProps) => {
  const [groupName, setGroupName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroupName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = async () => {
    if (!groupName.trim()) return;

    setIsLoading(true);
    try {
      await onSave(groupName.trim());
      onClose();
    } catch (error) {
      console.error("Failed to update group name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Name this group
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your group name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-4">
          <button
            onClick={handleSave}
            disabled={!groupName.trim() || isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupNameEditModal;
