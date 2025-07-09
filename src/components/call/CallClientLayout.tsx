"use client";

import { getLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

const CallClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  const headerStyle = getHeaderStyleWithStatusBar();

  return <div style={headerStyle}>{children}</div>;
};

export default CallClientLayout;
