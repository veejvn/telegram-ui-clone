"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 space-y-6 font-sans">
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

    <h1 className="text-center font-semibold text-2xl mb-4">Share Sheet</h1>

      <div>
        {Object.keys(toggles).map((key) => {
          const typedKey = key as ToggleKey;
          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-white dark:bg-black border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 rounded-t-xl first:rounded-t-xl"
            >
              <span className="text-sm font-medium">{key}</span>
              <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
                <input
                  type="checkbox"
                  checked={toggles[typedKey]}
                  onChange={() =>
                    setToggles({ ...toggles, [typedKey]: !toggles[typedKey] })
                  }
                  className="sr-only peer"
                  aria-label="checkbox"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    toggles[typedKey]
                      ? "bg-green-500"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white dark:bg-black rounded-full transition-transform duration-200 ${
                    toggles[typedKey] ? "translate-x-5" : ""
                  }`}
                ></div>
              </label>
            </div>
          );
        })}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Suggestions will appear in the Share Sheet and Spotlight search
          results. Archived chats will not be suggested.
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">SUGGEST BY</p>
        <RadioGroup
          value={suggestBy}
          onChange={setSuggestBy}
          className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800"
        >
          {["All Sent Messages", "Only Shared Messages"].map((option) => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ checked }) =>
                `flex items-center justify-between p-4 ${
                  checked ? "bg-zinc-100 dark:bg-zinc-900" : ""
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

      <button className="w-full text-sm font-medium text-red-500 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 py-3 rounded-xl">
        Reset All Share Suggestions
      </button>
    </div>
  );
}
