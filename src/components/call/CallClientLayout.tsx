"use client";

import { getLS } from "@/tools/localStorage.tool";

const CallClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const statusBarHeight = getLS("statusBarHeight");

  const headerStyle = {
    paddingTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };

  return <div style={headerStyle}>{children}</div>;
};

export default CallClientLayout;
