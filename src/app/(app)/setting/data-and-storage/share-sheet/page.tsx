"use client";
import { useState } from "react";
import { CheckCircle, ChevronLeft } from "lucide-react";
import { RadioGroup } from "@headlessui/react";
import { useRouter } from "next/navigation";

type ToggleKey = "Contacts" | "Saved Messages" | "Private Chats" | "Groups";

export default function AutoDownloadSettings() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    Contacts: true,
    "Saved Messages": true,
    "Private Chats": false,
    Groups: false,
  });
  const [suggestBy, setSuggestBy] = useState("All Sent Messages");

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

      <h1 className="text-center text-2xl mb-2">Share Sheet</h1>

      <div>
        {Object.keys(toggles).map((key) => {
          const typedKey = key as ToggleKey;
          return (
            <div key={key} className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">{key}</span>
              <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
                <input
                  type="checkbox"
                  checked={toggles[typedKey]}
                  onChange={() =>
                    setToggles({ ...toggles, [typedKey]: !toggles[typedKey] })
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    toggles[typedKey] ? "bg-green-500" : "bg-gray-700"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    toggles[typedKey] ? "translate-x-5" : ""
                  }`}
                ></div>
              </label>
            </div>
          );
        })}
        <p className="text-xs text-neutral-500 mt-2">
          Suggestions will appear in the Share Sheet and Spotlight search
          results. Archived chats will not be suggested.
        </p>
      </div>

      <div>
        <p className="text-sm text-neutral-400 mb-2">SUGGEST BY</p>
        <RadioGroup
          value={suggestBy}
          onChange={setSuggestBy}
          className="bg-neutral-900 rounded-xl divide-y divide-neutral-800"
        >
          {["All Sent Messages", "Only Shared Messages"].map((option) => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ checked }) =>
                `flex items-center justify-between p-4 ${
                  checked ? "bg-neutral-800" : ""
                }`
              }
            >
              {({ checked }) => (
                <div className="flex items-center w-full">
                  <span className="text-sm font-medium">{option}</span>
                  {checked && <CheckCircle className="ml-auto text-blue-500" />}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>

      <button className="w-full text-sm font-medium text-red-500 bg-neutral-900 py-3 rounded-xl">
        Reset All Share Suggestions
      </button>
    </div>
  );
}
