"use client";
import { Search } from "lucide-react";
import React, { useState } from "react";

export default function ForwardSearchBar() {
  // const [text, setText] = useState("");
  const [isFocus, setIsFocus] = useState(false);

  return (
    <div
      className={`mx-2.5 mt-4 mb-1.5
        ${isFocus ? "flex items-center justify-between gap-2" : ""}`}
    >
      <div
        className=" flex items-center 
      bg-gray-300/75 w-full rounded-lg h-8 px-3 justify-center gap-1"
        onClick={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      >
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          className={`bg-transparent outline-none text-base 
          placeholder-gray-500/80 text-start ${
            isFocus ? "w-full" : "w-1/6 lg:w-1/28"
          }`}
          placeholder="Search"
        />
      </div>
      <button
        className={
          isFocus ? "block px-1 text-md text-blue-600 cursor-pointer" : "hidden"
        }
        onClick={() => setIsFocus(false)}
      >
        Cancel
      </button>
    </div>
  );
}
