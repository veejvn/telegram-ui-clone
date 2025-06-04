"use client";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { Slider } from "@mui/material";
import { Check, ChevronRight, Image, Play, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-black text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button className="text-blue-400 mr-4" onClick={() => router.back()}>
          &lt; Back
        </button>
        <h2 className="text-lg font-semibold flex-1 text-center">
          Using Wi-Fi
        </h2>
        <div className="w-16" />
      </div>

      <div className="flex justify-between items-center bg-neutral-800 p-4 rounded-xl">
        <span className="text-sm">Auto-Download Media</span>
        <Switch
          checked={autoDownload}
          onChange={setAutoDownload}
          className={`${autoDownload ? "bg-green-500" : "bg-gray-600"}
            relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              autoDownload ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </Switch>
      </div>

      <div>
        <p className="text-sm mb-2 text-neutral-400">DATA USAGE</p>
        <Slider
          value={sliderValue}
          onChange={(e, newValue) => setSliderValue(newValue)}
          min={0}
          max={100}
          className="text-white"
        />
        <div className="flex justify-between text-xs text-neutral-400 px-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <p className="text-sm mb-2 text-neutral-400">TYPES OF MEDIA</p>
        <div className="bg-neutral-900 rounded-xl divide-y divide-neutral-800">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="text-xl">{item.icon}</div>
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-neutral-400">{item.value}</div>
                </div>
              </div>
              <ChevronRight className="text-neutral-600" />
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2 px-1">
          Voice messages are tiny, they are always downloaded automatically.
        </p>
      </div>
    </div>
  );
}
