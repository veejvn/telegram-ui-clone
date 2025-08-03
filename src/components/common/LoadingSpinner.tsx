"use client";

import { useEffect, useState } from "react";

// Clip-path polygons: clockwise fill
const segments = [
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)", // 25%
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)", // 50%
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)", // 75%
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)", // 100%
];

export default function LoadingSpinner() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % segments.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-20 h-20 bg-transparent flex items-center justify-center">
      <div
        className="w-12 h-12 bg-blue-600 rounded-full"
        style={{
          clipPath: segments[step],
          transition: "clip-path 0.2s ease-in-out",
        }}
      />
    </div>
  );
}
