"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Lock } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/common/ModeToggle";
import { useTheme } from "next-themes";

import DefaultIcon from "@/icons/telegram/DefaultIcon";
import SunsetIcon from "@/icons/telegram/SunsetIcon";
import MonoBlackIcon from "@/icons/telegram/MonoBlackIcon";
import ClassicIcon from "@/icons/telegram/ClassicIcon";
import ClassicBlackIcon from "@/icons/telegram/ClassicBlackIcon";
import FilledIcon from "@/icons/telegram/FilledIcon";
import FilledBlackIcon from "@/icons/telegram/FilledBlackIcon";
import PremiumIcon from "@/icons/telegram/PremiumIcon";
import TurboIcon from "@/icons/telegram/TurboIcon";
import BlackIcon from "@/icons/telegram/BlackIcon";
import AquaIcon from "@/icons/telegram/AquaIcon";

interface SettingItem {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode | string;
  path?: string;
}

const nightModeItems: SettingItem[] = [
  { title: "Night Mode", extra: <ModeToggle /> },
  { title: "Auto-Night Mode", extra: <span className="text-sm text-gray-400">System</span> },
];

const textDisplayItems: SettingItem[] = [
  { title: "Text Size" },
  { title: "Message Corners" },
  { title: "Animations" },
  { title: "Stickers and Emoji" },
];

const colorThemeItems: SettingItem[] = [
  { title: "Chat Themes", path: "/setting/chat-themes" },
  { title: "Chat Wallpaper", path: "/setting/chat-wallpaper" },
  { title: "Your Color", path: "/setting/your-color" },
];

const iconOptions = [
  { label: "Default", svg: <DefaultIcon className="w-full h-full" /> },
  { label: "Aqua", svg: <AquaIcon className="w-full h-full" /> },
  { label: "Sunset", svg: <SunsetIcon className="w-full h-full" /> },
  { label: "Mono Black", svg: <MonoBlackIcon className="w-full h-full" /> },
  { label: "Classic", svg: <ClassicIcon className="w-full h-full" /> },
  { label: "Classic Black", svg: <ClassicBlackIcon className="w-full h-full" /> },
  { label: "Filled", svg: <FilledIcon className="w-full h-full" /> },
  { label: "Filled Black", svg: <FilledBlackIcon className="w-full h-full" /> },
  { label: "Premium", svg: <PremiumIcon className="w-full h-full" />, premium: true },
  { label: "Turbo", svg: <TurboIcon className="w-full h-full" />, premium: true },
  { label: "Black", svg: <BlackIcon className="w-full h-full" />, premium: true },
];

export default function AppearancePage() {
  const [showNextMedia, setShowNextMedia] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();

  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className={`min-h-screen pb-6 ${isDark ? "bg-[#101014] text-white" : "bg-[#f5f6fa] text-black"}`}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="w-[92%] flex items-center justify-between mb-2">
          <button onClick={() => router.back()} className="flex items-center text-sm text-blue-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-base font-semibold">Appearance</h1>
          <div className="w-10" />
        </div>

        <div className="mt-2 w-[92%]">
          <h2 className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1">Color Theme</h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-[#181818]" : "bg-white"}`}>
            <div className="w-full overflow-hidden">
              <Image
                src={isDark ? "/chat/images/icons-appearance/chat-theme-preview-dark.jpg" : "/chat/images/icons-appearance/chat-theme-preview-light.jpg"}
                alt="Chat Preview"
                width={400}
                height={200}
                className="w-full h-auto"
              />
            </div>
            {colorThemeItems.map((item, idx) => (
              <Link
                key={item.title}
                href={item.path || "#"}
                className={`flex items-center justify-between px-4 py-2 ${isDark ? "text-white" : "text-black"} ${idx !== colorThemeItems.length - 1 ? isDark ? "border-b border-[#232323]" : "border-b border-gray-200" : ""}`}
              >
                <div className="text-[15px] font-normal">{item.title}</div>
                <div className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <SettingGroup title="Night Mode" items={nightModeItems} isDark={isDark} />
        <SettingGroup title="Text and Display" items={textDisplayItems} isDark={isDark} />

        <div className="mt-6 w-[92%]">
          <h2 className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1">App Icon</h2>
          <div className="grid grid-cols-4 gap-3">
            {iconOptions.map((icon) => (
              <div key={icon.label} className="flex flex-col items-center space-y-1">
                <div className="relative w-[72px] h-[72px] rounded-[20px] overflow-hidden">
                  {icon.svg}
                  {icon.premium && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <Lock className="h-3 w-3 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <span className="text-xs text-center text-gray-400 leading-tight">{icon.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 w-[92%]">
          <h2 className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1">Other</h2>
          <div className={`rounded-2xl ${isDark ? "bg-[#181818]" : "bg-white"} overflow-hidden`}>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm">Tap to Show Next Media</span>
              <Switch checked={showNextMedia} onCheckedChange={setShowNextMedia} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 px-1">
            Tap near the edge of the screen while viewing media to navigate between photos.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingGroup({ title, items, isDark }: { title: string; items: SettingItem[]; isDark: boolean }) {
  return (
    <div className="mt-4 w-[92%]">
      <h2 className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1">{title}</h2>
      <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-[#181818]" : "bg-white"}`}>
        {items.map((item, idx) => (
          <Link
            key={item.title}
            href={item.path || "#"}
            className={`flex items-center justify-between px-4 py-2 ${isDark ? "text-white" : "text-black"} ${idx !== items.length - 1 ? isDark ? "border-b border-[#232323]" : "border-b border-gray-200" : ""}`}
          >
            <div className="text-[15px] font-normal">{item.title}</div>
            <div className="flex items-center space-x-2">
              {item.extra && (
                <span className="text-[15px] text-gray-400 font-normal">{item.extra}</span>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
