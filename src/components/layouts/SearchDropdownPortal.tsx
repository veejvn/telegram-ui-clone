import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SearchDropdownPortal({
  anchorRef,
  children,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (onClose) {
          onClose();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 4 + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        zIndex: 9999,
      });
    }
  }, [anchorRef.current]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="rounded-xl shadow-lg border border-gray-200 dark:border-[#232323] bg-white dark:bg-[#181818] overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
}
