import React from "react";
import { Camera, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateChannelPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/chat/newMessage">
          <div className="flex items-center text-blue-500 hover:opacity-70 cursor-pointer">
            <ChevronLeft size={22} className="mr-1" />
            <span className="text-base">Back</span>
          </div>
        </Link>
        <h1 className="text-md font-semibold text-center">Create Channel</h1>
        <button className="text-blue-500 text-base font-semibold cursor-pointer hover:opacity-70">
          Next
        </button>
      </div>

      {/* Channel Name Input */}
      <div className="bg-[#181818] rounded-lg mx-4 mt-6 flex items-center px-4 py-4">
        <label className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center mr-4 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" />
          <Camera size={28} className="text-blue-400" />
        </label>
        <input
          type="text"
          placeholder="Channel Name"
          className="bg-transparent outline-none text-lg text-gray-400 placeholder-gray-500 flex-1"
        />
      </div>

      {/* Description Input */}
      <div className="bg-[#181818] rounded-lg mx-4 mt-4 px-4 py-3">
        <input
          type="text"
          placeholder="Description"
          className="w-full bg-transparent outline-none text-base text-gray-400 placeholder-gray-500"
        />
      </div>
      <div className="text-xs text-gray-500 mx-6 my-2">
        <p>You can provide an optional description for your channel.</p>
      </div>
    </div>
  );
}
