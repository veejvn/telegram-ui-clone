"use client";

import React from "react";
import { X } from "lucide-react";
import { useEditStore } from "@/stores/useEditStore";

const EditMessageInput = () => {
  const { editMessage: editMsg, clearEditMessage, isEditing } = useEditStore();

  if (!editMsg || !isEditing) return null;

  return (
    <div className="">
      <div className="bg-[#FFFFFF4D] rounded-t-[36px] p-3">
        {/* Header với text gốc */}
        <div className="flex gap-2 ml-2">
          {/* Đường gạch dọc bên trái */}
          <div className="w-[3px] bg-[#026AE0] rounded-full"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-500">Edit</span>
              <button
                onClick={clearEditMessage}
                className="flex justify-center items-center ml-auto p-1 size-9 rounded-full bg-[#8080804D] transition-colors"
                title="Cancel"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            {/* Text gốc được hiển thị */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="truncate max-h-12 overflow-hidden">
                {editMsg.text.length > 80
                  ? editMsg.text.substring(0, 80) + "..."
                  : editMsg.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMessageInput;
