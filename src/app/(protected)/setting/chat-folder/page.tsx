"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";

export default function FolderPage() {
  const [showFolderTags, setShowFolderTags] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div className="min-h-screen px-0 pt-0 pb-10 bg-[#efeff4] dark:bg-black transition-colors">
      <Head>
        <meta name="theme-color" content={isDark ? "#000" : "#efeff4"} />
      </Head>
      {/* Header luôn né status bar */}
      <div style={headerStyle} className="flex justify-between items-center px-4 pt-4 mb-6">
        <button
          type="button"
          className="text-blue-500 text-base font-medium"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-base font-bold text-black dark:text-white">
          Folders
        </h1>
        <button type="button" className="text-blue-500 text-base font-medium">
          Edit
        </button>
      </div>

      {/* Folder Icon */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-[140px] h-[100px] flex items-center justify-center rounded-2xl mb-4">
          <img
            src="/chat/images/folder.png"
            alt="Folder"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm px-6">
          Create folders for different groups of chats and quickly switch
          between them.
        </p>
      </div>

      <div className="text-xs text-gray-400 font-semibold mb-2 px-4">
        FOLDERS
      </div>

      {/* Folder List */}
      <div
        className={`
          mb-4 mx-2 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#232323] 
          overflow-hidden shadow-sm
        `}
      >
        <div className="px-4 py-3">
          <p className="text-blue-500 text-sm font-medium">Create a Folder</p>
        </div>
        <div className="border-t border-[#e5e5ea] dark:border-[#232323] px-4 py-3">
          <p className="text-sm text-black dark:text-white">All Chats</p>
        </div>
      </div>

      <p className="text-gray-400 dark:text-gray-500 text-xs mb-6 px-4">
        Tap 'Edit' to change the order or delete folders.
      </p>

      {/* Switch */}
      <div
        className={`
          mx-2 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#232323]
          flex justify-between items-center px-4 py-3
        `}
      >
        <span className="text-sm font-medium text-black dark:text-white">
          Show Folder Tags
        </span>
        <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
          <Input
            type="checkbox"
            className="sr-only peer"
            checked={showFolderTags}
            onChange={() => setShowFolderTags(!showFolderTags)}
          />
          {/* Track */}
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-300 ${showFolderTags
              ? "bg-green-500"
              : isDark
                ? "bg-gray-700"
                : "bg-gray-300"
              }`}
          />
          {/* Thumb */}
          <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-5" />
        </label>
      </div>

      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 px-4">
        Display folder names for each chat in the chat list.
      </p>
    </div>
  );
}
