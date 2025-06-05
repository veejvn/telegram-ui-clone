"use client";
import { useState } from "react";
import {
  CheckCircle,
  Trash2,
  Plus,
  ChevronRight,
  Globe,
  Compass
} from "lucide-react";
import { RadioGroup } from "@headlessui/react";
import { useRouter } from "next/navigation";

const browsers = [
  { name: "Telegram", icon: <Globe className="text-blue-400" /> },
  { name: "Safari", icon: <Compass className="text-green-400" /> },
];

export default function AutoDownloadSettings() {
  const [selectedBrowser, setSelectedBrowser] = useState("Telegram");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-black text-black dark:text-white p-4 space-y-6 font-sans">
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

    <h1 className="text-center font-semibold text-2xl mb-4">Web Browser</h1>

      <div>
        <p className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">OPEN LINKS IN</p>
        <RadioGroup
          value={selectedBrowser}
          onChange={setSelectedBrowser}
          className="space-y-1"
        >
          {browsers.map((browser) => (
            <RadioGroup.Option
              key={browser.name}
              value={browser.name}
              className={({ checked }) =>
                `flex items-center justify-between bg-white dark:bg-[#18181b] p-4 rounded-xl ${
                  checked ? "border border-blue-500" : "border border-zinc-200 dark:border-zinc-700"
                }`
              }
            >
              {({ checked }) => (
                <div className="flex items-center space-x-3 w-full">
                  {browser.icon}
                  <span className="text-sm font-medium flex-grow text-black dark:text-white">
                    {browser.name}
                  </span>
                  {checked && <CheckCircle className="text-blue-500" />}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>

      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center space-x-3">
        <Trash2 className="text-blue-500" />
        <span className="text-sm font-medium text-black dark:text-white">Clear Cookies</span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Delete all cookies in the Telegram in-app browser. This action will sign
        you out of most websites.
      </p>

      <div>
        <p className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">
          NEVER OPEN IN THE IN-APP BROWSER
        </p>
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="text-blue-500" />
            <span className="text-sm font-medium text-black dark:text-white">Add Website</span>
          </div>
          <ChevronRight className="text-zinc-400 dark:text-zinc-600" />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          These websites will be always opened in your default browser.
        </p>
      </div>
    </div>
  );
}
