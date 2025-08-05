"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, BellOff } from "lucide-react";
import clsx from "clsx";

export default function MuteDurationMenu({
  onBack,
  onCustomMuteClick,
  onMute,
}: {
  onBack: () => void;
  onCustomMuteClick: () => void;
  onMute: (ms: number) => void; // ✅ chỉnh lại để truyền ms
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const muteOptions = [
    { label: "1 hour", ms: 60 * 60 * 1000 },
    { label: "8 hours", ms: 8 * 60 * 60 * 1000 },
    { label: "1 day", ms: 24 * 60 * 60 * 1000 },
    { label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  ];

  const handleMuteClick = (label: string, ms: number) => {
    setToastMessage(`Notifications are muted for ${label}.`);
    setShowToast(true);
    onMute(ms); // ✅ truyền ms lên
  };

  const handleCustomMute = () => {
    const until = new Date();
    until.setHours(until.getHours() + 3); // ví dụ: mute thêm 3 tiếng

    const formattedTime = until.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    setToastMessage(`Notifications are muted until ${formattedTime}.`);
    setShowToast(true);
    onCustomMuteClick(); // mở modal chọn thời gian cụ thể
  };

  // Tự động ẩn toast sau 3s
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      <div className="absolute right-0 mt-2 z-50 w-52 bg-white dark:bg-[#202020] rounded-xl shadow-xl">
        <ul className="flex flex-col text-sm text-gray-900 dark:text-gray-100">
          {/* Back */}
          <li
            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back</span>
          </li>

          <li className="h-[5px] my-1 bg-[#f3f3f3] dark:bg-[#3a3a3c]" />

          {/* Mute options */}
          {muteOptions.map((opt) => (
            <li
              key={opt.label}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
              onClick={() => handleMuteClick(opt.label, opt.ms)}
            >
              <div className="w-1 h-1" />
              <span>{`Mute for ${opt.label}`}</span>
            </li>
          ))}

          {/* Custom Mute */}
          <li
            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
            onClick={handleCustomMute}
          >
            <div className="w-1 h-1" />
            <span>Mute until...</span>
          </li>
        </ul>
      </div>

      {/* Toast */}
      {showToast && toastMessage && (
        <div
          className={clsx(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "bg-[#333] text-white dark:bg-[#444]",
            "px-4 py-2 rounded-full shadow-lg text-sm",
            "flex items-center gap-2",
            "whitespace-nowrap max-w-full"
          )}
        >
          <BellOff className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
