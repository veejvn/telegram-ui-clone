"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const SETTINGS_KEYS = [
  "notifications",
  "messagePreview",
  "storyNotifications",
  "displayAuthorName",
];

const defaultValues: Record<string, "on" | "off"> = {
  notifications: "on",
  messagePreview: "on",
  storyNotifications: "on",
  displayAuthorName: "on",
};

const ALERT_TONES = [
  "Default (Rebound)",
  "None",
  "Rebound",
  "Antic",
  "Cheers",
  "Droplet",
  "Handoff",
  "Milestone",
  "Passage",
  "Portal",
  "Rattle",
  "Slide",
  "Welcome",
  "Note",
  "Hello",
  "Input",
  "Keys",
  "Popcorn",
  "Pulse",
  "Synth",
];

const CLASSIC_TONES = [
  "Tri-tone",
  "Tremolo",
  "Alert",
  "Bell",
  "Calypso",
  "Chime",
  "Glass",
  "Telegraph",
];

export default function CustomizeMuteSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] =
    useState<Record<string, "on" | "off">>(defaultValues);
  const [selectedTone, setSelectedTone] = useState("Default (Rebound)");

  // Load from localStorage
  useEffect(() => {
    if (!open) return;

    const stored = localStorage.getItem("mute-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultValues);
      }
    } else {
      setSettings(defaultValues);
    }

    const storedTone = localStorage.getItem("alert-tone");
    if (storedTone) {
      setSelectedTone(storedTone);
    }
  }, [open]);

  // Save settings to localStorage
  const saveToStorage = (newSettings: typeof settings) => {
    localStorage.setItem("mute-settings", JSON.stringify(newSettings));
  };

  const handleSelect = (key: string, value: "on" | "off") => {
    const updated = {
      ...settings,
      [key]: value,
    };
    setSettings(updated);
    saveToStorage(updated);
  };

  const handleSelectTone = (tone: string) => {
    setSelectedTone(tone);
    localStorage.setItem("alert-tone", tone);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end">
      <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="text-[#007aff] text-base font-medium"
          >
            Cancel
          </button>
          <div className="text-base font-semibold text-black dark:text-white">
            Huy
          </div>
          <button
            onClick={onClose}
            className="text-[#007aff] text-base font-medium"
          >
            Done
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-4 py-3 space-y-6 overflow-y-auto pb-6 flex-1 min-h-0">
          {SETTINGS_KEYS.map((key) => (
            <div key={key}>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {formatTitle(key)}
              </div>
              <div className="bg-gray-100 dark:bg-[#2a2a2a] rounded-xl overflow-hidden">
                <div
                  className="flex justify-between items-center px-4 py-3 border-b border-gray-300 dark:border-[#444] cursor-pointer"
                  onClick={() => handleSelect(key, "on")}
                >
                  <span>Always On</span>
                  {settings[key] === "on" && (
                    <div className="text-blue-600 font-bold">✓</div>
                  )}
                </div>
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer"
                  onClick={() => handleSelect(key, "off")}
                >
                  <span>Always Off</span>
                  {settings[key] === "off" && (
                    <div className="text-blue-600 font-bold">✓</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Upload Sound Section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Telegram Tones
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#444] rounded-xl px-4 py-3 flex items-center gap-2 cursor-pointer">
              <span className="text-blue-600">🎵 Upload Sound</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press and hold a short voice note or MP3 file in any chat and
              select &quot;Save for Notifications&quot;. It will appear here.
            </p>
          </div>

          {/* Alert Tone Selection */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Alert Tones
            </div>
            <div className="bg-gray-100 dark:bg-[#2a2a2a] rounded-xl overflow-hidden">
              {[...ALERT_TONES, ...CLASSIC_TONES].map((tone) => (
                <div
                  key={tone}
                  className="flex justify-between items-center px-4 py-3 border-b border-gray-300 dark:border-[#444] cursor-pointer last:border-none"
                  onClick={() => handleSelectTone(tone)}
                >
                  <span>{tone}</span>
                  {selectedTone === tone && (
                    <div className="text-blue-600 font-bold">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function formatTitle(key: string) {
  switch (key) {
    case "notifications":
      return "Notifications";
    case "messagePreview":
      return "Message Preview";
    case "storyNotifications":
      return "Story Notifications";
    case "displayAuthorName":
      return "Display Author Name";
    default:
      return key;
  }
}
