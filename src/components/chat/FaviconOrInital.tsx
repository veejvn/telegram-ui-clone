"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FaviconOrInitialProps {
  url: string;
  siteName?: string;
}

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

const getInitial = (url: string): string => {
  const hostname = getHostname(url);
  return hostname.charAt(0).toUpperCase() || "W";
};

const getFaviconUrl = (url: string): string => {
  const hostname = getHostname(url);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
};

export default function FaviconOrInitial({ url, siteName }: FaviconOrInitialProps) {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = getFaviconUrl(url);

  return (
    <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
      {!imgError ? (
        <Image
          src={faviconUrl}
          alt="favicon"
          width={32}
          height={32}
          onError={() => setImgError(true)}
          className="object-contain"
        />
      ) : (
        <span className="text-base font-semibold text-zinc-600 dark:text-zinc-300">
          {getInitial(url)}
        </span>
      )}
    </div>
  );
}
