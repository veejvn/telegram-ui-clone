"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";
import { useTheme } from "next-themes";

export default function Stories() {
  const router = useRouter();
  const [newStories, setNewStories] = useState(true);
  const [importantStories, setImportantStories] = useState(true);
  const [showSenderName, setShowSenderName] = useState(true);

  // Theme + status bar logic
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white p-4">
      <Head>
        <meta name="theme-color" content={isDark ? "#101014" : "#fff"} />
      </Head>
      {/* Header né status bar */}
      <div className="flex items-center justify-between mb-6" style={headerStyle}>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400"
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center">Stories</h1>
        <div className="w-16" />
      </div>

      {/* Toggle Sections */}
      <p className="text-gray-600 dark:text-gray-400 font-medium uppercase text-sm px-1 mb-1 mt-4">
        NOTIFY ME ABOUT...
      </p>
      <div className="space-y-1">
        {/* New Stories */}
        <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl">
          <span>New Stories</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <Input
              id="new-stories"
              type="checkbox"
              checked={newStories}
              onChange={() => setNewStories(!newStories)}
              className="sr-only peer"
              aria-label="New Stories"
            />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {/* Important Stories */}
        <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl">
          <span>Important Stories</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <Input
              id="important-stories"
              type="checkbox"
              checked={importantStories}
              onChange={() => setImportantStories(!importantStories)}
              className="sr-only peer"
              aria-label="Important Stories"
            />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Automatically enable story notifications from the 5 users you contact
          most frequently
        </p>

        {/* Options Section */}
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-400">
            OPTIONS
          </h2>

          {/* Show Sender's Name */}
          <div className="flex justify-between items-center bg-gray-100 dark:bg-[#18181b] p-4 rounded-xl mb-4">
            <span>Show Sender's Name</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                id="show-sender-name"
                type="checkbox"
                checked={showSenderName}
                onChange={() => setShowSenderName(!showSenderName)}
                className="sr-only peer"
                aria-label="Show Sender's Name"
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
                router.push("/setting/notification-and-sound/stories/sound")
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
