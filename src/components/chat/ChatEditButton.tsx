import React from "react";

export default function ChatEditButton({ isEditMode, onEdit, onDone }) {
  return (
    <button
      className="text-blue-500 font-medium w-10 cursor-pointer"
      onClick={isEditMode ? onDone : onEdit}
    >
      {isEditMode ? "Done" : "Edit"}
    </button>
  );
}