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
    document.addEventListener("touchend", onTouchEnd, { passive: false });

    // Chặn wheel zoom (pinch zoom trên trackpad)
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", onWheel, { passive: false });

    // Chặn keyboard zoom (Ctrl/Cmd + +/-)
    const onKeydown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeydown);

    // Thêm meta tag để chặn zoom nếu chưa có
    const addViewportMeta = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.setAttribute("name", "viewport");
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      );
    };

    addViewportMeta();

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKeydown);
    };
  }, []);

  return null;
}
