"use client";
import { useState } from "react";
import {
  CheckCircle,
  Trash2,
  Plus,
  ChevronRight,
  Globe,
  Compass,
  ChevronLeft
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
    <div className="min-h-screen bg-black text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-blue-400 cursor-pointer"
        >
          <ChevronLeft className="text-blue-400" />
          <span className="text-xl font-semibold">Back</span>
        </button>
      </div>

      <h1 className="text-center text-2xl mb-2">Web Browser</h1>

      <div>
        <p className="text-sm text-neutral-400 mb-2">OPEN LINKS IN</p>
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
                `flex items-center justify-between bg-neutral-900 p-4 rounded-xl ${
                  checked ? "border border-blue-500" : ""
                }`
              }
            >
              {({ checked }) => (
                <div className="flex items-center space-x-3 w-full">
                  {browser.icon}
                  <span className="text-sm font-medium flex-grow">
                    {browser.name}
                  </span>
                  {checked && <CheckCircle className="text-blue-500" />}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>

      <div className="bg-neutral-900 rounded-xl p-4 flex items-center space-x-3">
        <Trash2 className="text-blue-500" />
        <span className="text-sm font-medium">Clear Cookies</span>
      </div>
      <p className="text-xs text-neutral-500">
        Delete all cookies in the Telegram in-app browser. This action will sign
        you out of most websites.
      </p>

      <div>
        <p className="text-sm text-neutral-400 mb-2">
          NEVER OPEN IN THE IN-APP BROWSER
        </p>
        <div className="bg-neutral-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="text-blue-500" />
            <span className="text-sm font-medium">Add Website</span>
          </div>
          <ChevronRight className="text-neutral-600" />
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          These websites will be always opened in your default browser.
        </p>
      </div>
    </div>
  );
}
