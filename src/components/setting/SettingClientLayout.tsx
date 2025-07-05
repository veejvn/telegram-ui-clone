"use client";

import { getLS } from "@/tools/localStorage.tool";

const SettingClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const statusBarHeight = getLS("statusBarHeight");

  const layoutSettingStyle = {
    paddingTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };
  return <div style={layoutSettingStyle}>{children}</div>;
};

export default SettingClientLayout;
