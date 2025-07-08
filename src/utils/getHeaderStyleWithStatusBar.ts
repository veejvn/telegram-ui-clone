// src/utils/getHeaderStyle.ts
import { getLS } from "@/tools/localStorage.tool"; // thay đường dẫn đúng
import React from "react";

const statusBarHeight = getLS("statusBarHeight");

export function getHeaderStyleWithStatusBar() {
  return {
    paddingTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };
}

export function getMarginStyleWithStatusBar() {
  return {
    marginTop: statusBarHeight ? Number(statusBarHeight) : 0,
  };
}

export function incomingCallStyleWithStatusBar() : React.CSSProperties{
     const topValue = statusBarHeight ? Number(statusBarHeight) + 16 : 16; // 16 = 4*4px (top-4)
     return {
       top: topValue,
     };
}