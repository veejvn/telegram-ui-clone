import { Settings2 } from "lucide-react";
import React from "react";
import BlueForward from "./icons/BlueForward";
import { useForwardStore } from "@/stores/useForwardStore";

export default function MultiForwardMsgPreview() {
  const messages = useForwardStore((state) => state.messages);
  if (messages.length < 1) return null;
  const msg = messages[0];

  return (
    <>
      <div className="flex justify-between pt-1.5 px-2 items-center border-t dark:border-t-gray-50/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 mr-4 text-blue-600 lg:w-10 lg:h-10">
            <Settings2
              className=" w-2.5 h-2.5 lg:w-4.5 lg:h-4.5 
            absolute bottom-[107px] left-[9px] lg:bottom-[101px] lg:left-[10px]"
            />
            <BlueForward />
          </div>
          <div className="w-0.5 h-9 lg:h-12 lg:w-1 bg-blue-600 rounded-lg"></div>
          <div className="text-sm lg:text-lg  ">
            <p className="text-blue-600 -mb-1">Forward Message</p>
            <p className="text-gray-400 -mt-0.5">
              {msg.sender}: {msg.text}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
