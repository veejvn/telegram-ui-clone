"use client";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { ChevronRight, Image, Play, Plus, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AutoDownloadSettings() {
  const [photoSave, setPhotoSave] = useState(false);
  const [videoSave, setVideoSave] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-blue-400 cursor-pointer"
        >
          <ChevronLeft className="text-blue-400" />
          <span className="text-xl font-semibold">Back</span>
        </button>
      </div>

      <h1 className="text-center text-2xl mb-2">Group Chats</h1>

      <div>
        <p className="text-sm text-neutral-400 mb-2">SAVE TO PHOTOS</p>

        <div className="bg-neutral-900 rounded-xl divide-y divide-neutral-800">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-3">
              <Image className="text-cyan-400" />
              <span className="text-sm font-medium">Photos</span>
            </div>
            <Switch
              checked={photoSave}
              onChange={setPhotoSave}
              className={`${
                photoSave ? "bg-green-500" : "bg-gray-600"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  photoSave ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-3">
              <Play className="text-blue-500" />
              <span className="text-sm font-medium">Videos</span>
            </div>
            <Switch
              checked={videoSave}
              onChange={setVideoSave}
              className={`${
                videoSave ? "bg-green-500" : "bg-gray-600"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  videoSave ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>
        </div>

        <p className="text-xs text-neutral-500 mt-2">
          Automatically save all new media from private chats to your Photos
          app.
        </p>
      </div>

      <div>
        <p className="text-sm text-neutral-400 mb-2">EXCEPTIONS</p>
        <div className="bg-neutral-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="text-blue-500" />
            <span className="text-sm font-medium">Add Exception</span>
          </div>
          <ChevronRight className="text-neutral-600" />
        </div>
      </div>
    </div>
  );
}
