"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    webAppListener: ((eventName: string, payload?: string) => void) | undefined;
  }
}

export function useWebAppListener(
  eventHandler: (eventName: string, payload?: string) => void
) {
  useEffect(() => {
    window.webAppListener = (eventName: string, payload?: string) => {
      eventHandler?.(eventName, payload);
    };

    return () => {
      window.webAppListener = undefined;
    };
  }, [eventHandler]);
}
