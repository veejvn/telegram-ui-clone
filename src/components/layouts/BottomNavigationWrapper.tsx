"use client";

import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { getLS } from "@/tools/localStorage.tool";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BottomNavInner() {
  const pathname = usePathname();
  const isChatDetailPage = pathname ? /^\/chat(\/.+)+$/.test(pathname) : false;
  const isSettingPage = pathname ? pathname.startsWith("/setting/") : false;
  const isCallPage = pathname ? pathname.startsWith("/call/") : false;
  const searchParams = useSearchParams();
  const hideFromQuery = searchParams.get("hide");
  const hide = hideFromQuery ? hideFromQuery.split(",") : getLS("hide") || [];
  const options = Array.isArray(hide) ? hide : [];
  const onlyChat =
    options.includes("call") &&
    options.includes("contact") &&
    options.includes("setting");
  const shouldShowBottomNav =
    !isChatDetailPage && !isSettingPage && !isCallPage && !onlyChat;
  if (!shouldShowBottomNav) return null;
  return <BottomNavigattion hideOptions={hide} />;
}

export default function BottomNavigationWrapper() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}
