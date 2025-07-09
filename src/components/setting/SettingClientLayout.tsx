"use client";

import { getLS } from "@/tools/localStorage.tool";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

const SettingClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {


  return <div>{children}</div>;
};

export default SettingClientLayout;
