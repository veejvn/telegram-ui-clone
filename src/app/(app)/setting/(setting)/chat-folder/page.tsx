"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
export default function FolderPage() {
  const [showFolderTags, setShowFolderTags] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          className="text-blue-400"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-lg font-semibold">Folders</h1>
        <button type="button" className="text-blue-400">Edit</button>
      </div>

      {/* Folder Icon */}
      <div className="flex justify-center mb-3">
        <img src="/images/folder.png" alt="Folder" className="w-20 h-20" />
      </div>
      <p className="text-center text-gray-400 mb-4">
        Create folders for different groups of chats and quickly switch between
        them.
      </p>
      <p className="text-gray-400">FOLDERS</p>
      {/* Folder List */}
      <div className="space-y-3 mb-6">
        <div className="bg-[#1C1C1E] rounded-xl p-4">
          <p className="text-blue-400">Create a Folder</p>
        </div>
        <div className="bg-[#1C1C1E] rounded-xl p-4">
          <p>All Chats</p>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Tap 'Edit' to change the order or delete folders.
        </p>
      </div>

      {/* Switch */}
      <div className="bg-[#1C1C1E] rounded-xl p-4 flex justify-between items-center">
        <span>Show Folder Tags</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Input
            type="checkbox"
            className="sr-only peer"
            checked={showFolderTags}
            onChange={() => setShowFolderTags(!showFolderTags)}
          />
          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:left-[4px] after:top-[3px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>
      <p className="text-gray-500 text-sm mt-2">
        Display folder names for each chat in the chat list.
      </p>
    </div>
  );
}
