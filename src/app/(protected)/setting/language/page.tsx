'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Check, Lock, Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch-language"; // <-- Custom Switch with showLock

const AVAILABLE_LANGUAGES = [
  { label: 'English', sub: 'English' },
  { label: 'Arabic', sub: 'العربية' },
  { label: 'Belarusian', sub: 'Беларуская' },
  { label: 'Catalan', sub: 'Català' },
  { label: 'Croatian', sub: 'Hrvatski' },
  { label: 'Czech', sub: 'Čeština' },
  { label: 'Dutch', sub: 'Nederlands' },
  { label: 'Finnish', sub: 'Suomi' },
  { label: 'French', sub: 'Français' },
  { label: 'German', sub: 'Deutsch' },
  { label: 'Malay', sub: 'Bahasa Melayu' },
  { label: 'Norwegian (Bokmål)', sub: 'Norsk (Bokmål)' },
  { label: 'Persian', sub: 'فارسی' },
  { label: 'Polish', sub: 'Polski' },
  { label: 'Portuguese (Brazil)', sub: 'Português (Brasil)' },
  { label: 'Romanian', sub: 'Română' },
  { label: 'Russian', sub: 'Русский' },
  { label: 'Serbian', sub: 'Српски' },
  { label: 'Slovak', sub: 'Slovenčina' },
  { label: 'Spanish', sub: 'Español' },
  { label: 'Swedish', sub: 'Svenska' },
  { label: 'Turkish', sub: 'Türkçe' },
  { label: 'Ukrainian', sub: 'Українська' },
  { label: 'Uzbek', sub: "O'zbek" },
];

export default function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('English');
  const [showTranslate, setShowTranslate] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-[#101014]">
      <div className="px-4 pt-4 pb-2">
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
              // placeholder="Search"  // <-- BỎ dòng này
              readOnly
              style={{ color: 'transparent', textShadow: '0 0 0 #b0b0b0' }} // Đảm bảo không hiện text
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
                key={lang.label}
                onClick={() => setSelected(lang.label)}
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
                {selected === lang.label && <Check className="w-5 h-5 text-blue-500 mt-1" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="h-16" />
    </div>
  );
}
