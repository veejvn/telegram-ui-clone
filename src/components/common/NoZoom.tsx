"use client";
import { useEffect } from "react";

export default function NoZoom() {
  useEffect(() => {
    // Chặn pinch-zoom và double-tap zoom
    const preventDefault = (e: any) => e.preventDefault();

    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);

    // Chặn zoom bằng touchmove (pinch)
    const touchMoveHandler = (e: any) => {
      if (e.scale !== 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", touchMoveHandler, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener("touchmove", touchMoveHandler);
    };
  }, []);

  return null;
}