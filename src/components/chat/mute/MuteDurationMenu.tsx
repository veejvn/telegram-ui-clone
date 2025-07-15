"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, BellOff } from "lucide-react";
import clsx from "clsx"; // nếu bạn đã cài clsx, nếu không dùng template string bình thường

export default function MuteDurationMenu({
  onBack,
  onCustomMuteClick,
  onMute
}: {
  onBack: () => void;
  onCustomMuteClick: () => void;
  onMute: () => void;
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const muteOptions = ["1 hour", "8 hours", "1 day", "7 days"];

  const handleMuteClick = (label: string) => {
    setToastMessage(`Notifications are muted for ${label}.`);
    setShowToast(true);
    onMute(); // gọi hàm để đánh dấu là đã mute
  };

  const handleCustomMute = () => {
    const until = new Date();
    until.setHours(until.getHours() + 3); // ví dụ thêm 3 tiếng

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

  // Tự động ẩn sau 3s
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 w-52 bg-white dark:bg-[#202020] rounded-xl shadow-xl">
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
          {muteOptions.map((label) => (
            <li
              key={label}
              className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
              onClick={() => handleMuteClick(label)}
            >
              <div className="w-1 h-1" />{" "}
              {/* Placeholder để căn trái đều */}
              <span>{`Mute for ${label}`}</span>
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
