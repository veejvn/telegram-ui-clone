'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Check, Lock, Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch-language";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";
import { useTheme } from "next-themes";
import { AVAILABLE_LANGUAGES, getInitialLang, LANG_CODE_KEY, LANG_LABEL_KEY } from '@/utils/setting/language';

export default function LanguagePage() {
  const router = useRouter();
  // State ngôn ngữ: object thay vì chỉ label/code
  const [selected, setSelected] = useState(() => getInitialLang());
  const [showTranslate, setShowTranslate] = useState(false);

  // Lưu khi đổi ngôn ngữ
  useEffect(() => {
    if (selected) {
      localStorage.setItem(LANG_CODE_KEY, selected.code);
      localStorage.setItem(LANG_LABEL_KEY, selected.label);
    }
  }, [selected]);

  // --- Theme + status bar ---
  const { theme } = useTheme();
  const isDark = theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-[#101014]">
      <Head>
        <meta name="theme-color" content={isDark ? "#101014" : "#fafafb"} />
      </Head>
      {/* Header luôn né status bar */}
      <div style={headerStyle} className="px-4 pt-4 pb-2">
        {/* Back + Title */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-500 hover:underline text-[17px] font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </button>
          <span className="flex-1 text-center font-bold text-[18px] ml-[-45px]">Language</span>
        </div>
        {/* Search */}
        <div className="w-full flex justify-center mb-3 mt-2">
          <div className="relative w-full max-w-md">
            <input
              className="w-full h-10 rounded-xl bg-zinc-100 dark:bg-[#232323] pl-0 pr-0 text-base focus:outline-none border border-zinc-200 dark:border-[#232323] text-center text-transparent caret-zinc-500"
              // placeholder="Search"
              readOnly
              style={{ color: 'transparent', textShadow: '0 0 0 #b0b0b0' }}
              aria-label='input'
            />
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="flex items-center gap-2 text-zinc-400">
                <Search className="w-5 h-5" />
                <span className="text-base">Search</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Translate Messages */}
      <div className="w-full px-4">
        <div className="text-xs font-semibold text-zinc-500 mb-2 tracking-wide">TRANSLATE MESSAGES</div>
        <div className="bg-white dark:bg-[#181818] rounded-2xl p-1 shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800 mb-4">
          {/* Show Translate Button */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-medium">Show Translate Button</span>
            <Switch checked={showTranslate} onCheckedChange={() => setShowTranslate(!showTranslate)} />
          </div>
          {/* Translate Entire Chats */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-medium flex items-center gap-1">
              Translate Entire Chats
            </span>
            <Switch checked={false} disabled showLock />
          </div>
        </div>
        {/* Note */}
        <div className="text-xs text-zinc-500 mb-6 px-1">
          Show a 'Translate' button when holding down on a message.<br />
          <br />
          Google may have access to the text of messages you translate.
        </div>
        {/* Interface Language */}
        <div className="text-xs font-semibold text-zinc-500 mb-2 tracking-wide">INTERFACE LANGUAGE</div>
        <Card className="rounded-2xl bg-white dark:bg-[#181818]">
          <CardContent className="p-0">
            {AVAILABLE_LANGUAGES.map((lang, idx) => (
              <div
                key={lang.code}
                onClick={() => setSelected(lang)}
                className={
                  "flex items-start justify-between px-4 py-2.5 cursor-pointer transition-colors " +
                  (idx !== AVAILABLE_LANGUAGES.length - 1
                    ? "border-b border-zinc-100 dark:border-zinc-800"
                    : "")
                }
              >
                <div>
                  <span className="font-semibold text-[17px] leading-tight">{lang.label}</span>
                  <br />
                  <span className="text-[15px] text-zinc-500 leading-none">{lang.sub}</span>
                </div>
                {selected.code === lang.code && <Check className="w-5 h-5 text-blue-500 mt-1" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="h-16" />
    </div>
  );
}
