"use client";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { Slider } from "@mui/material";
import { Check, ChevronRight, Image, Play, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

export default function AutoDownloadSettings() {
  const [autoDownload, setAutoDownload] = useState(true);
  const [sliderValue, setSliderValue] = useState(100);
  const router = useRouter();
  const items = [
    {
      icon: <Image className="text-orange-500" />,
      label: "Photos",
      value: "On for all chats",
    },
    {
      icon: <Check className="text-pink-500" />,
      label: "Stories",
      value: "On for all chats",
    },
    {
      icon: <Play className="text-red-500" />,
      label: "Videos",
      value: "Up to 15 MB for all chats",
    },
    {
      icon: <FileText className="text-blue-500" />,
      label: "Files",
      value: "Up to 3,0 MB for all chats",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-black text-black dark:text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6"
        style={getHeaderStyleWithStatusBar()}
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

      <h1 className="text-center font-semibold text-2xl mb-4">
        Using Wifi
      </h1>

      <div className="flex justify-between items-center bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl mb-4">
        <span className="text-sm text-black dark:text-white">
          Auto-Download Media
        </span>
        <Switch
          checked={autoDownload}
          onChange={setAutoDownload}
          className={`${autoDownload ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
            }
            relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#18181b] transition-transform duration-200 ${autoDownload ? "translate-x-5" : "translate-x-1"
              }`}
          />
        </Switch>
      </div>

      <div>
        <p className="text-sm mb-2 text-zinc-400 dark:text-zinc-300">
          DATA USAGE
        </p>
        <Slider
          value={sliderValue}
          onChange={(e, newValue) => setSliderValue(newValue as number)}
          min={0}
          max={100}
          className="text-blue-500"
        />
        <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-300 px-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <p className="text-sm mb-2 text-zinc-400 dark:text-zinc-300">
          TYPES OF MEDIA
        </p>
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="text-xl">{item.icon}</div>
                <div>
                  <div className="text-sm font-medium text-black dark:text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-300">
                    {item.value}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-zinc-400 dark:text-zinc-600" />
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 px-1">
          Voice messages are tiny, they are always downloaded automatically.
        </p>
      </div>
    </div>
  );
}
