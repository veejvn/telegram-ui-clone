import React from "react";
import { Lock } from "lucide-react";

export function Switch({
  checked,
  disabled,
  showLock = false,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  showLock?: boolean;
  onCheckedChange?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-checked={checked}
      onClick={disabled ? undefined : onCheckedChange}
      className={
        "relative w-11 h-6 rounded-full transition " +
        (checked ? "bg-blue-500" : "bg-zinc-400 dark:bg-zinc-700") +
        (disabled ? " opacity-60 cursor-not-allowed" : " cursor-pointer")
      }
    >
      <span
        className={
          "absolute left-0 top-0.5 transition-all duration-200 " +
          (checked ? "translate-x-5" : "translate-x-1")
        }
      >
        <span className="block w-5 h-5 rounded-full bg-white flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
          {showLock && (
            // Thu nhỏ icon lock cho vừa vặn hơn
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </span>
      </span>
    </button>
  );
}
