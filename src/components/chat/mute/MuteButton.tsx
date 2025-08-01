"use client";

import React, { useEffect, useRef, useState } from "react";
import { BellOff, VolumeOff, Volume2, Settings2 } from "lucide-react";
import { MuteIcon, BellMutedIcon } from "@/components/chat/icons/InfoIcons";
import MuteDurationMenu from "./MuteDurationMenu";
import { MuteUntilPicker } from "./MuteUntilPicker";
import CustomizeMuteSheet from "./CustomizeMuteSheet";
import { createPortal } from "react-dom";

interface MuteButtonProps {
  onMuteUntil: (date: Date) => void;
  roomId: string;
}

export default function MuteButton({ onMuteUntil, roomId }: MuteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const soundSetting = localStorage.getItem(`chat-sound-enabled-${roomId}`);
    const mutedSetting = localStorage.getItem(`chat-muted-${roomId}`);
    const unmuteAt = localStorage.getItem(`chat-unmute-at-${roomId}`);

    setIsSoundEnabled(soundSetting !== null ? JSON.parse(soundSetting) : false);
    setIsMuted(mutedSetting !== null ? JSON.parse(mutedSetting) : false);

    if (unmuteAt) {
      const unmuteTime = parseInt(unmuteAt, 10);
      if (Date.now() >= unmuteTime) {
        setIsMuted(false);
        localStorage.setItem(`chat-muted-${roomId}`, JSON.stringify(false));
        localStorage.removeItem(`chat-unmute-at-${roomId}`);
      } else {
        scheduleAutoUnmute(unmuteTime);
      }
    }
  }, [roomId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowSubmenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    localStorage.setItem(
      `chat-sound-enabled-${roomId}`,
      JSON.stringify(newState)
    );

    setToastMessage(
      newState
        ? "You will receive notifications with sound."
        : "You will receive silent notifications."
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };
  function scheduleAutoUnmute(unmuteAt: number) {
    const now = Date.now();
    const delay = unmuteAt - now;
    if (delay > 0) {
      setTimeout(() => {
        setIsMuted(false);
        localStorage.setItem(`chat-muted-${roomId}`, JSON.stringify(false));
        localStorage.removeItem(`chat-unmute-at-${roomId}`);
      }, delay);
    }
  }

  const handleMuteFor = (ms: number) => {
    setIsMuted(true);
    localStorage.setItem(`chat-muted-${roomId}`, JSON.stringify(true));
    const unmuteAt = Date.now() + ms;
    localStorage.setItem(`chat-unmute-at-${roomId}`, unmuteAt.toString());
    scheduleAutoUnmute(unmuteAt);
  };
  return (
    <>
      <div ref={containerRef} className="relative">
        <div
         className="flex flex-col justify-end items-center group cursor-pointer"
          onClick={() => {
            if (isMuted) {
              setIsMuted(false);
              localStorage.setItem(
                `chat-muted-${roomId}`,
                JSON.stringify(false)
              );
              localStorage.removeItem(`chat-unmute-at-${roomId}`);
              setToastMessage("Notifications are unmuted.");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2500);
            } else {
              setIsOpen((prev) => !prev);
              setShowSubmenu(false);
            }
          }}
        >
          {isMuted ? <BellMutedIcon /> : <MuteIcon />}
          <p className="text-xs text-[#155dfc] font-semibold">
            {isMuted ? "Unmute" : "Mute"}
          </p>
        </div>

        {isOpen && !showSubmenu && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 w-52 bg-white dark:bg-[#202020] rounded-xl shadow-xl">
            <ul className="flex flex-col text-sm text-gray-900 dark:text-gray-100">
              <li
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
                onClick={() => setShowSubmenu(true)}
              >
                <span>Mute for...</span>
                <BellOff className="w-4 h-4" />
              </li>

              <li className="h-[5px] my-1 bg-[#f3f3f3] dark:bg-[#3a3a3c] pointer-events-none" />

              <li
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
                onClick={handleToggleSound}
              >
                {isSoundEnabled ? "Enable Sound" : "Disable Sound"}
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeOff className="w-4 h-4" />
                )}
              </li>

              <li
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  setShowSubmenu(false);
                  setShowCustomize(true);
                }}
              >
                Customize
                <Settings2 className="w-4 h-4" />
              </li>

              <li
                className="flex items-center justify-between px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-[#3a3a3c] cursor-pointer"
                onClick={() => {
                  setIsMuted(true);
                  localStorage.setItem(
                    `chat-muted-${roomId}`,
                    JSON.stringify(true)
                  );
                  setIsOpen(false);
                  setToastMessage("Notifications are muted.");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2500);
                }}
              >
                Mute Forever
                <BellOff className="w-4 h-4" />
              </li>
            </ul>
          </div>
        )}

        {isOpen && showSubmenu && (
          <MuteDurationMenu
            onBack={() => setShowSubmenu(false)}
            onCustomMuteClick={() => {
              setShowPicker(true);
              setIsOpen(false);
              setShowSubmenu(false);
            }}
            onMute={(ms) => handleMuteFor(ms)}
          />
        )}
      </div>
      {/* Bottom Sheet: Custom Date Picker */}
      <MuteUntilPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(date) => {
          onMuteUntil(date);
          setIsMuted(true);
          localStorage.setItem(`chat-muted-${roomId}`, JSON.stringify(true));
          localStorage.setItem(
            `chat-unmute-at-${roomId}`,
            date.getTime().toString()
          );
          scheduleAutoUnmute(date.getTime());
          setShowPicker(false);
        }}
      />

      {/* Bottom Sheet: Customize Settings */}
      <CustomizeMuteSheet
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
        roomId={roomId}
      />

      {/* Toast notification */}
      {showToast &&
        createPortal(
          <div className="fixed bottom-[20px] left-4 right-4 z-[9999] bg-[#444] text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
              <path d="M6.26 6.26A9.77 9.77 0 0 0 6 8c0 3.31-2.69 6-6 6" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span className="truncate">{toastMessage}</span>
          </div>,
          document.body
        )}
    </>
  );
}
