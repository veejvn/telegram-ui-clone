// src/app/(app)/setting/appearance/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AppearancePage() {
  const router = useRouter();
  const [dark, setDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', JSON.stringify(dark));
  }, [dark]);

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

      <h1 className="text-2xl font-semibold">Appearance</h1>

      <Card className="bg-zinc-900 rounded-2xl">
        <CardContent className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 h-9 w-9 rounded-full flex items-center justify-center text-white">
              <Palette className="h-5 w-5" />
            </div>
            <span className="text-base text-white">Dark Mode</span>
          </div>
          <Switch checked={dark} onCheckedChange={setDark} />
        </CardContent>
      </Card>
    </div>
  );
}