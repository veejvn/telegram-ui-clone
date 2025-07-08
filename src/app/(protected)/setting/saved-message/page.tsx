"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Search, Mic, Clock } from "lucide-react";

export default function SavedMessagesPage() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background for light mode */}
      <Image
        src="/chat/images/chat-bg-light.jpg"
        alt="Saved Background Light"
        fill
        className="object-cover z-0 dark:hidden"
        priority
      />

      {/* Background for dark mode */}
      <Image
        src="/chat/images/chat-bg-dark.jpg"
        alt="Saved Background Dark"
        fill
        className="object-cover z-0 hidden dark:block"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/80 dark:from-black/40 dark:to-black/80 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <button onClick={() => router.back()} className="text-blue-500 text-base font-medium">
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-black dark:text-white">Saved Messages</h1>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            {/* ModeToggle removed */}
          </div>
        </div>

        {/* Info box */}
        <div className="px-6 mt-20 text-center">
          <div className="mx-auto max-w-md bg-white/80 dark:bg-black/50 rounded-2xl py-4 px-6 shadow backdrop-blur">
            <div className="flex justify-center mb-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600 dark:text-blue-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v2H3a1 1 0 000 2h1v2a6 6 0 0012 0v-2h1a1 1 0 000-2h-1V8a6 6 0 00-6-6zm4 10a4 4 0 11-8 0v-2h8v2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Your Cloud Storage</h2>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside text-left">
              <li>Forward messages here to save them</li>
              <li>Send media and files to store them</li>
              <li>Access this chat from any device</li>
              <li>Use search to quickly find things</li>
            </ul>

          </div>
        </div>

        {/* Message input */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 rounded-full bg-white dark:bg-zinc-800 shadow px-4 py-2">
            <Paperclip className="w-5 h-5 text-gray-500 cursor-pointer" />
            <Input
              type="text"
              placeholder="Message"
              className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-sm"
            />
            <Clock className="w-5 h-5 text-gray-500 cursor-pointer" />
            <Mic className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
