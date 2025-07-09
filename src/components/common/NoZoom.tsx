"use client";
import { useEffect } from "react";

export default function NoZoom() {
  useEffect(() => {
    // Chặn pinch-zoom và double-tap zoom (iOS)
    const preventDefault = (e: any) => e.preventDefault();

    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);

    // Chỉ chặn touchmove khi đang pinch-zoom (e.scale !== 1)
    const touchMoveHandler = (e: any) => {
      // e.scale chỉ tồn tại trên iOS khi pinch, còn lại undefined
      if (typeof e.scale === "number" && e.scale !== 1) {
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