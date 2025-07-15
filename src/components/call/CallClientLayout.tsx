"use client";

import { getLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { callService } from "@/services/callService";
import GetCookie from "@/components/auth/GetCookie";
const CallClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  const headerStyle = getHeaderStyleWithStatusBar();
  const fromMainApp = getLS("fromMainApp")
  const route = useRouter()
  const hide = getLS("hide") || [];
  const options = Array.isArray(hide) && fromMainApp ? hide : [];

  if (options.includes("call")) {
    route.push("/chat")
  }
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
  return <div style={headerStyle}>{children}</div>;
};

export default CallClientLayout;
