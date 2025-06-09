// src/app/(app)/setting/appearance/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, ChevronLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/common/ModeToggle";

export default function AppearancePage() {
  const router = useRouter();

  return (
    <div className="p-4 space-y-4">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-sm"
      >
        <ChevronLeft className="size-5" />
        <span>Settings</span>
      </button>

      <h1 className="text-2xl font-semibold">Appearance</h1>

      <Card className="rounded-2xl py-0">
        <CardContent className="flex items-center justify-between mb-0 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 h-9 w-9 rounded-full flex items-center justify-center text-white">
              <Palette className="h-5 w-5" />
            </div>
            <span className="text-base">Dark Mode</span>
          </div>
          {/* <Switch checked={dark} onCheckedChange={setDark} /> */}
          <ModeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
