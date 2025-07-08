import { ChatEditButtonPros } from "@/types/chat";
import React from "react";

export default function ChatEditButton({
  isEditMode,
  onEdit,
  onDone,
  className,
}: ChatEditButtonPros) {
  return (
    <button
      className={`text-blue-500 font-medium w-10 cursor-pointer ${className}`}
      onClick={isEditMode ? onDone : onEdit}
    >
      {isEditMode ? "Done" : "Edit"}
    </button>
  );
}
