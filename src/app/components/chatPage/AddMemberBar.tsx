import React from "react";

export default function AddMemberBar() {
  return (
    <div className="px-5 py-3 border-t border-b border-gray-800">
      <input
        type="text"
        placeholder="Who would you like to add?"
        className="flex-1 h-auto resize-none bg-transparent outline-none 
            text-white"
      />
    </div>
  );
}
