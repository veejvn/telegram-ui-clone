"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AutoDownloadSettings() {
  const [useProxy, setUseProxy] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center mb-6 ">
        <button
          className="text-blue-400 mr-4 cursor-pointer"
          onClick={() => router.back()}
          aria-label="Close"
        >
          Close
        </button>
        <div className="w-8" />
      </div>

      <h1 className="text-center text-2xl mb-4">Proxy</h1>

      <div className="bg-neutral-900 rounded-xl">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">Use Proxy</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={() => setUseProxy(!useProxy)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm text-neutral-400 mb-2">SAVED PROXIES</p>
        <div className="bg-neutral-900 rounded-xl">
          <div className="flex items-center space-x-2 p-4 text-blue-500">
            <Plus size={18} />
            <span className="text-sm font-medium">Add Proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
}