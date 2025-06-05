"use client";

import { useRouter } from "next/navigation";
import {  Upload, Download } from "lucide-react";

export default function NetworkUsagePage() {
  const router = useRouter();

  return (
    <div className="text-black dark:text-white bg-[#f6f6f6] dark:bg-black min-h-screen p-4 px-4 sm:px-6 lg:px-8 space-y-6 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-400"
        >
          &lt; Back
        </button>
        <div className="w-16" />
      </div>

      {/* Chart Placeholder */}
      <div className="flex justify-center items-center mb-6">
        <div className="relative w-[180px] h-[180px]">
          <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray={`${76.3} ${100 - 76.3}`}
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#6366f1"
              strokeWidth="4"
              strokeDasharray={`${22.5} ${100 - 22.5}`}
              strokeDashoffset={-76.3}
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-black dark:text-white text-sm font-bold">
            32.4 MB
          </div>
        </div>
      </div>

      <h1 className="text-center font-semibold text-2xl mb-2">Data Usage</h1>

      <p className="text-center text-sm text-zinc-400 dark:text-zinc-300 mb-6">
        Your data usage since May 12, 2025 at 4:14 PM
      </p>

      {/* Tabs */}
      <div className="flex justify-around mb-4">
        {["All", "Mobile", "Wi-Fi"].map((tab) => (
          <div
            key={tab}
            className="text-sm px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-black dark:text-white"
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Usage List */}
      <div className="space-y-2">
        {[
          { name: "Files", value: "24.8 MB", color: "bg-green-600" },
          { name: "Messages", value: "7.3 MB", color: "bg-indigo-600" },
          { name: "Stickers", value: "338.7 KB", color: "bg-yellow-400" },
          { name: "Calls", value: "0 B", color: "bg-orange-500" },
          { name: "Music", value: "0 B", color: "bg-pink-600" },
          { name: "Photos", value: "0 B", color: "bg-cyan-400" },
          { name: "Videos", value: "0 B", color: "bg-blue-600" },
          { name: "Voice Messages", value: "0 B", color: "bg-purple-600" },
        ].map((item) => (
          <div key={item.name} className="flex justify-between items-center bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-3 rounded">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className="text-black dark:text-white">{item.name}</span>
            </div>
            <span className="text-sm text-zinc-400 dark:text-zinc-300">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Total Usage */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-3 rounded">
          <div className="flex items-center space-x-2">
            <Upload className="text-blue-400" size={18} />
            <span className="text-black dark:text-white">Data Sent</span>
          </div>
          <span className="text-sm text-zinc-400 dark:text-zinc-300">541.7 KB</span>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-3 rounded">
          <div className="flex items-center space-x-2">
            <Download className="text-green-400" size={18} />
            <span className="text-black dark:text-white">Data Received</span>
          </div>
          <span className="text-sm text-zinc-400 dark:text-zinc-300">31.9 MB</span>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-8">
        <button className="w-full py-3 text-red-500 border border-red-500 rounded-lg">
          Reset Statistics
        </button>
      </div>
    </div>
  );
}