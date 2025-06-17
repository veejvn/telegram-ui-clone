"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Channels() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400"
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center">Channels</h1>
        <div className="w-16" />
      </div>

      {/* Toggle Sections */}
      <div className="space-y-4">
        {/* Show Notifications */}
        <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl">
          <span>Show Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <Input
              type="checkbox"
              checked={showNotifications}
              onChange={() => setShowNotifications(!showNotifications)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {/* Options Section */}
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-400">
            OPTIONS
          </h2>

          {/* Message Preview */}
          <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl mb-4">
            <span>Message Preview</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                type="checkbox"
                checked={messagePreview}
                onChange={() => setMessagePreview(!messagePreview)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* Sound */}
          <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl">
            <span>Sound</span>
            <button
              type="button"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400"
              onClick={() =>
                router.push("/setting/notification-and-sound/channels/sound")
              }
            >
              <span>Rebound</span>
              <span className="text-lg">{">"}</span>
            </button>
          </div>
        </div>

        {/* Add Exception */}
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-400">
            EXCEPTIONS
          </h2>
          <button
            type="button"
            className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl w-full"
          >
            <span className="text-blue-600 dark:text-blue-400">
              + Add Exception
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
