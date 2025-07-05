"use client";

import { getLS } from "@/tools/localStorage.tool";

const NewMessageClientLayout = ({
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

export default NewMessageClientLayout;
