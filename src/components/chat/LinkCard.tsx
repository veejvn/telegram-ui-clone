"use client";

import React from "react";
import FaviconOrInitial from "./FaviconOrInital";

interface LinkCardProps {
  url: string;
  title: string;
}

export default function LinkCard({ url, title }: LinkCardProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <FaviconOrInitial url={url} />
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium text-zinc-800 dark:text-white truncate">
          {title}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 truncate"
        >
          {url}
        </a>
      </div>
    </div>
  );
}
