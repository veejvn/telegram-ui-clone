import { useState, useRef, useEffect } from "react";

export default function ChatEditButton({ onEdit }: { onEdit: () => void }) {
  return (
    <button
      className="text-blue-500 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-800"
      onClick={onEdit}
    >
      Edit
    </button>
  );
}