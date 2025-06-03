import { Eclipse, Focus, Mic, Paperclip } from "lucide-react";
import React from "react";

const ChatComposer = () => {
  return (
    <>
      <div
        className="flex justify-between items-center
      bg-white dark:bg-[#1c1c1e] px-2.5 py-2 lg:py-3"
      >
        <div>
          <Paperclip
            className="text-[#858585]
          hover:scale-110 hover:text-zinc-300
          cursor-pointer
          transition-all ease-in-out duration-700"
            size={30}
          />
        </div>
        <div
          className="outline-2 p-1.5 rounded-full
  flex items-center justify-between lg:w-[1000px]"
        >
          <textarea
            placeholder="Message"
            rows={1}
            className="flex-1 h-auto resize-none bg-transparent outline-none 
            px-3 max-h-48 overflow-y-auto"
          />
          <Eclipse
            className="text-[#858585]
    hover:scale-110 hover:text-zinc-300
    cursor-pointer
    transition-all ease-in-out duration-700"
            size={30}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* <Focus
            className="text-[#858585]
            hover:scale-110 hover:text-white
            cursor-pointer
            transition-all ease-in-out duration-700"
            size={30}
          /> */}

          <Mic
            className="text-[#858585]
            hover:scale-110 hover:text-zinc-300
            cursor-pointer
            transition-all ease-in-out duration-700"
            size={30}
          />
        </div>
      </div>
    </>
  );
};

export default ChatComposer;
