"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar"; // <-- import hàm này

export default function AutoDownloadSettings() {
  const [useProxy, setUseProxy] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6"
        style={getHeaderStyleWithStatusBar()} // <-- Né status bar
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-400"
        >
          &lt; Back
        </button>
        <div className="w-16" />
      </div>

      <h1 className="text-center font-semibold text-2xl mb-4">Proxy</h1>

      <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">Use Proxy</span>
          <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={() => setUseProxy(!useProxy)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full transition-all duration-200
              ${useProxy ? "bg-green-500" : "bg-zinc-300 dark:bg-gray-700"}`}></div>
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-200
              bg-white dark:bg-black ${useProxy ? "translate-x-5" : ""}`}></div>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm text-zinc-400 dark:text-neutral-400 mb-2">SAVED PROXIES</p>
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="flex items-center space-x-2 p-4 text-blue-500">
            <Plus size={18} />
            <span className="text-sm font-medium">Add Proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
