// src/app/(app)/setting/language/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ChevronLeft, Check } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  'English',
  'Tiếng Việt',
  'Español',
  'Français',
  'Deutsch',
  '日本語',
  '한국어',
];

export default function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('English');

  return (
    <div className="p-4 bg-black min-h-screen text-white space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-sm text-gray-400"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Settings</span>
      </button>

      <h1 className="text-2xl font-semibold">Language</h1>

      <Card className="bg-zinc-900 rounded-2xl">
        <CardContent className="flex flex-col divide-y divide-zinc-700">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <div
              key={lang}
              onClick={() => setSelected(lang)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-violet-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-base">{lang}</span>
              </div>
              <div className="flex items-center space-x-2">
                {selected === lang && <Check className="h-5 w-5 text-blue-400" />}
                <ChevronLeft className="opacity-0 h-5 w-5" /> {/* giữ khoảng trống */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
