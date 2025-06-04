"use client";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { ChevronRight, Image, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AutoDownloadSettings() {
  const [photoSave, setPhotoSave] = useState(false);
  const [videoSave, setVideoSave] = useState(false);
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

    <h1 className="text-center font-semibold text-2xl mb-4">Private Chat</h1>

      <div>
        <p className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">SAVE TO PHOTOS</p>

        <div className="bg-white dark:bg-[#18181b] rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-3">
              <Image className="text-cyan-400" />
              <span className="text-sm font-medium text-black dark:text-white">Photos</span>
            </div>
            <Switch
              checked={photoSave}
              onChange={setPhotoSave}
              className={`${
                photoSave ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#18181b] transition-transform duration-200 ${
                  photoSave ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-3">
              <Play className="text-blue-500" />
              <span className="text-sm font-medium text-black dark:text-white">Videos</span>
            </div>
            <Switch
              checked={videoSave}
              onChange={setVideoSave}
              className={`${
                videoSave ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#18181b] transition-transform duration-200 ${
                  videoSave ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Automatically save all new media from private chats to your Photos
          app.
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-400 dark:text-zinc-300 mb-2">EXCEPTIONS</p>
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="text-blue-500" />
            <span className="text-sm font-medium text-black dark:text-white">Add Exception</span>
          </div>
          <ChevronRight className="text-zinc-400 dark:text-zinc-600" />
        </div>
      </div>
    </div>
  );
}
