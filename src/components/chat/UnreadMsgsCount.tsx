import React from "react";

export default function UnreadMsgsCount({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <div>
      <p
        className={`bg-blue-600 text-white text-sm rounded-full flex items-center justify-center ${
          count > 99 ? " px-2" : count > 9 ? "w-7 h-5 px-2.5" : "w-5 h-5"
        }`}
      >
        {count}
      </p>
    </div>
  );
}
