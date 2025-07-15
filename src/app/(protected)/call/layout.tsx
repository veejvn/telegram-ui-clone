// src/app/(protected)/call/layout.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { callService } from "@/services/callService";
import GetCookie from "@/components/auth/GetCookie";

export default function CallLayout({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.userId);
  const deviceId = useAuthStore((state) => state.deviceId);

  useEffect(() => {
    if (accessToken && userId && deviceId) {
      setChecked(true);
      callService.reinitialize();
    }
  }, [accessToken, userId, deviceId]);

  if (!checked) return <GetCookie />;
  return <main className="min-h-screen flex flex-col">{children}</main>;
}
