"use client";
import { useEffect } from "react";

export default function NoZoom() {
  useEffect(() => {
    // Chặn gesture zoom trên iOS
    const preventDefault = (e: any) => e.preventDefault();

    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);

    // Chặn double-tap zoom trên iOS bằng cách chặn double-tap
    let lastTouchEnd = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    document.addEventListener("touchend", onTouchEnd, false);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}