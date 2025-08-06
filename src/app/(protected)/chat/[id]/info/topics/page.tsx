"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TopicsSettingPage = () => {
  const [topicsEnabled, setTopicsEnabled] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#c9dbed] to-[#e7d7c7]">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-center font-medium text-lg">Topics</h1>
        <div className="w-10"></div> {/* Empty div for alignment */}
      </div>

      {/* Content */}
      <div className="mx-4 mt-4 bg-white/40 rounded-xl p-5 shadow-sm">
        {/* Topics icon */}
        <div className="flex justify-center my-4">
          <div className="relative w-[60px] h-[60px] grid grid-cols-2 gap-1.5">
            {/* Top left square */}
            <div className="bg-[#78a4dc] rounded-[8px]"></div>

            {/* Top right square */}
            <div className="bg-[#78a4dc] rounded-[8px]"></div>

            {/* Bottom left square */}
            <div className="bg-[#78a4dc] rounded-[8px]"></div>

            {/* Bottom right circle */}
            <div className="bg-[#3478F6] rounded-full"></div>
          </div>
        </div>

        {/* Topics toggle - Adjusted to match reference */}
        <div className="flex items-start justify-between mt-2">
          <div>
            <h2 className="text-[15px] font-medium text-[#2C2C2E]">
              Enable topics
            </h2>
            <p className="text-[13px] text-[#4E546A] pr-4 mt-0 leading-tight max-w-[280px]">
              Group chats are divided into topics that can be created by the
              group owner or any member
            </p>
          </div>

          {/* New improved switch that better matches Telegram */}
          <div
            onClick={() => setTopicsEnabled(!topicsEnabled)}
            className="mt-1 relative inline-flex items-center cursor-pointer"
          >
            <div
              className={`w-[46px] h-7 rounded-full transition-colors duration-300 ${
                topicsEnabled ? "bg-[#3478F6]" : "bg-[#E0E0E5]"
              }`}
            ></div>
            <div
              className={`absolute left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                topicsEnabled ? "translate-x-[22px]" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsSettingPage;
