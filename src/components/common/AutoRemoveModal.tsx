"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";

export default function AutoRemoveModal({
  isOpen,
  onClose,
  label,
  options,
  currentValue,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  options: string[];
  currentValue: string;
  onSelect: (value: string) => void;
}) {
  // Escape key để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      {/* Modal content */}
      <div className="w-full max-w-md bg-zinc-900 rounded-t-2xl p-4 animate-slide-up">
        <div className="text-center text-sm text-zinc-400 mb-4">
          {label}
        </div>

        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              onSelect(opt);
              onClose();
            }}
            className={`flex w-full justify-between py-3 px-2 text-white hover:bg-zinc-800 rounded-lg ${
              opt === currentValue ? "text-blue-400 font-semibold" : ""
            }`}
          >
            <span>{opt}</span>
            {opt === currentValue && <Check size={18} />}
          </button>
        ))}

        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-blue-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
