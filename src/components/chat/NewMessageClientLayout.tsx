"use client";

import { getLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

const NewMessageClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const headerStyle = getHeaderStyleWithStatusBar();

  return <>{children}</>;
};

export default NewMessageClientLayout;
