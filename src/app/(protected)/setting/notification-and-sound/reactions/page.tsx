"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Reactions() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [sound, setSound] = useState(false);
  const [newStories, setNewStories] = useState(true);
  const [importantStories, setImportantStories] = useState(true);
  const [showSenderName, setShowSenderName] = useState(true);
  const [reactionToMessages, setReactionToMessages] = useState(true);
  const [reactionToStories, setReactionToStories] = useState(true);
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-blue-400">
          &lt; Back
        </button>
        <h1 className="text-xl font-semibold flex-1 text-center">Reactions</h1>
        <div className="w-16" />
      </div>
      {/* Toggle Sections */}
      <p className="text-gray-400 font-medium uppercase text-sm px-1 mb-1 mt-4">
        NOTIFY ME ABOUT...
      </p>
      <div className="space-y-1">
        {/* Reaction to my Messages */}
        <div className="flex flex-col bg-[#18181b] p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span>Reaction to my Messages</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                id="reaction-to-messages"
                type="checkbox"
                checked={reactionToMessages}
                onChange={() => setReactionToMessages(!reactionToMessages)}
                className="sr-only peer"
                aria-label="Reaction to my Messages"
              />
              <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          <span className="text-blue-400 text-xs mt-1">From My Contacts</span>
        </div>
        {/* Reactions to my Stories */}
        <div className="flex flex-col bg-[#18181b] p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span>Reactions to my Stories</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <Input
                id="reaction-to-stories"
                type="checkbox"
                checked={reactionToStories}
                onChange={() => setReactionToStories(!reactionToStories)}
                className="sr-only peer"
                aria-label="Reactions to my Stories"
              />
              <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          <span className="text-blue-400 text-xs mt-1">From My Contacts</span>
        </div>
        {/* Options Section */}
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-4 text-gray-500">OPTIONS</h2>
          {/* Show Sender's Name*/}
          <div className="flex justify-between items-center bg-[#18181b] p-4 rounded-xl mb-4">
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
          <div className="flex justify-between items-center bg-[#18181b] p-4 rounded-xl">
            <span>Sound</span>
            <button
              type="button"
              className="flex items-center space-x-1 text-gray-400"
              onClick={() =>
                router.push("/setting/notification-and-sound/reactions/sound")
              }
            >
              <span>Rebound</span>
              <span className="text-lg">{">"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
