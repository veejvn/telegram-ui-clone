"use client";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useTheme } from "next-themes";
import Head from "next/head";
import { useRouter } from "next/navigation";

const PowerSavingPage = () => {
  const headerStyle = getHeaderStyleWithStatusBar();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="min-h-screen bg-white dark:bg-[#101014] flex flex-col">
      <Head>
        <meta name="theme-color" content={isDark ? "#101014" : "#fff"} />
      </Head>
      {/* Header né status bar */}
      <div
        className="flex items-center justify-between px-4 mb-8"
        style={headerStyle}
      >
        <button
          onClick={() => router.back()}
          className="text-blue-500 dark:text-blue-400 text-base font-medium"
        >
          &lt; Back
        </button>
        <span className="flex-1 text-center font-bold text-lg">
          Power Saving
        </span>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
          Power Saving Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          This page is under construction.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Please check back later!
        </p>
      </div>
    </div>
  );
};

export default PowerSavingPage;
