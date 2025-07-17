"use client";

import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { getLS, setLS } from "@/tools/localStorage.tool";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BottomNavInner() {
  const pathname = usePathname();
  const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
  const isSettingPage = pathname ? pathname.startsWith("/setting/") : false;
  const isCallPage = pathname ? pathname.startsWith("/call/") : false;
  const fromMainApp = getLS("fromMainApp")
  let hide = fromMainApp ? getLS("hide") : [];
  const hideArray = typeof hide === "string" ? hide.split(",") : hide;
  const options = Array.isArray(hideArray) ? hide : [];
  const onlyChat =
    options.includes("call") &&
    options.includes("contact") &&
    options.includes("setting");
  const shouldShowBottomNav =
    !isChatDetailPage && !isSettingPage && !isCallPage && !onlyChat;
  if (!shouldShowBottomNav) return null;
  return <BottomNavigattion hideOptions={hideArray} />;
}

export default function BottomNavigationWrapper() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}
