"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

export default function FolderPage() {
  const [showFolderTags, setShowFolderTags] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="px-4 pt-4 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          className="text-blue-500 text-base font-medium"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-base font-semibold">Folders</h1>
        <button type="button" className="text-blue-500 text-base font-medium">
          Edit
        </button>
      </div>

      {/* Folder Icon */}
      <div className="flex flex-col items-center mb-4">
        <img src="/images/folder.png" alt="Folder" className="w-20 h-20 mb-3" />
        <p className="text-center text-gray-500 text-sm px-6">
          Create folders for different groups of chats and quickly switch
          between them.
        </p>
      </div>

      <div className="text-xs text-gray-400 font-semibold mb-2">FOLDERS</div>

      {/* Folder List */}
      <div
        className={`space-y-2 divide-y rounded-2xl border overflow-hidden mb-4 ${
          isDark ? "border-gray-600" : "border-gray-300"
        }`}
      >
        <div className="p-3">
          <p className="text-blue-500 text-sm font-medium">Create a Folder</p>
        </div>
        <div className="p-3">
          <p className="text-sm">All Chats</p>
        </div>
      </div>

      <p className="text-gray-400 text-xs mb-6">
        Tap 'Edit' to change the order or delete folders.
      </p>

      {/* Switch */}
      <div
        className={`rounded-xl p-3 flex justify-between items-center border ${
          isDark ? "bg-[#1a1a1a] border-gray-600" : "bg-white border-gray-300"
        }`}
      >
        <span className="text-sm font-medium">Show Folder Tags</span>
        <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
          <Input
            type="checkbox"
            className="sr-only peer"
            checked={showFolderTags}
            onChange={() => setShowFolderTags(!showFolderTags)}
          />
          {/* Track */}
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-300 ${
              showFolderTags
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

      <p className="text-gray-400 text-xs mt-2">
        Display folder names for each chat in the chat list.
      </p>
    </div>
  );
}
