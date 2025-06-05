"use client";

import {
  // ChevronLeft,
  // User,
  // Users,
  // Megaphone,
  // LoaderCircle,
  Check,
} from "lucide-react";
import { PieChart } from "react-minimal-pie-chart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AutoRemoveSettings from "@/components/common/AutoRemoveSettings";

export default function StorageUsagePage() {
  const router = useRouter();
  const [slider, setSlider] = useState(100); // Slider cho cache size

  const usageData = [
    { label: "Misc", percent: 90.4, size: "12.6 MB", hex: "#ff8800" },
    { label: "Files", percent: 5.9, size: "853.3 KB", hex: "#22c55e" },
    { label: "Avatars", percent: 2.3, size: "342.8 KB", hex: "#a855f7" },
    { label: "Stickers", percent: 1.1, size: "169.1 KB", hex: "#6366f1" },
  ];

  return (
    <div className="bg-[#f6f6f6] dark:bg-black min-h-screen text-black dark:text-white px-4 pt-6 pb-24">
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

      {/* Total Usage Ring Chart */}
      <div className="flex justify-center my-6">
        <div className="relative w-52 h-52">
          <PieChart
            data={usageData.map((item) => ({
              title: item.label,
              value: item.percent,
              color: item.hex,
            }))}
            lineWidth={35}
            radius={48}
            label={({ dataEntry }) =>
              dataEntry.value > 3 ? `${dataEntry.value.toFixed(1)}%` : ""
            }
            labelStyle={{
              fontSize: "4px",
              fill: "#fff",
              pointerEvents: "none",
            }}
            labelPosition={80}
          />
          {/* Middle Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-lg font-bold text-black dark:text-white">
              14.0 MB
            </span>
          </div>
        </div>
      </div>

      <h1 className="text-center font-semibold text-2xl mb-2 text-black dark:text-white">
        Storage Usage
      </h1>

      <p className="text-center text-sm text-zinc-400 dark:text-zinc-300 mb-6">
        Telegram uses &lt;0.1% of your free disk space.
      </p>

      {/* Memory display bar */}
      <div className="w-full px-4 mb-4">
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: "1%" }} />
        </div>
      </div>

      {/* Breakdown list */}
      <div className="rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 mb-4">
        {usageData.map((item, idx) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-4 py-3 ${
              idx !== usageData.length - 1
                ? "border-b border-zinc-200 dark:border-zinc-700"
                : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: item.hex }}
              >
                <Check size={10} className="text-white" />
              </div>
              <span className="text-black dark:text-white">
                {item.label} {item.percent}%
              </span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-300">
              {item.size}
            </span>
          </div>
        ))}
        <button className="w-full py-3 text-center text-sm bg-blue-500 font-medium rounded-b-xl text-white">
          Clear Entire Cache <span className="text-blue-200">14 MB</span>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-center text-zinc-400 dark:text-zinc-300 mb-4">
        All media will stay in the Telegram cloud and can be re-downloaded if
        you need them again.
      </p>

      {/* Auto-remove cached media */}
      {<AutoRemoveSettings />}

      {/* Cache size slider */}
      <div className="rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-4 mb-4">
        <h2 className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">
          MAXIMUM CACHE SIZE
        </h2>
        <input
          type="range"
          min={0}
          max={100}
          value={slider}
          onChange={(e) => setSlider(+e.target.value)}
          className="w-full accent-blue-500"
          aria-label="Cache size slider"
        />
        <div className="flex justify-between text-sm text-zinc-400 dark:text-zinc-300 mt-2">
          <span>5 GB</span>
          <span>20 GB</span>
          <span>50 GB</span>
          <span>No Limit</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          If your cache size exceeds this limit, the oldest unused media will be
          removed from the device.
        </p>
      </div>
    </div>
  );
}
