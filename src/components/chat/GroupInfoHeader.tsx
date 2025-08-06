"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";

interface GroupInfoHeaderProps {
  room: sdk.Room;
}

const GroupInfoHeader = ({ room }: GroupInfoHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        className="flex items-center justify-center font-medium cursor-pointer bg-white/60 rounded-full p-1.5 border border-white
              bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 
              backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
        onClick={handleBack}
        title="Back"
        aria-label="Back"
      >
        <ChevronLeft size={20} />
      </button>
      <h1 className="font-semibold">{"My Group"}</h1>
      <div className="w-8" /> {/* Spacer for centering */}
    </div>
  );
};

export default GroupInfoHeader;
