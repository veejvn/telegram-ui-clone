"use client";
import React, { useState } from "react";
import ForwardSearchBar from "./ForwardSearchBar";
import ForwardList from "./ForwardList";
import { useRouter } from "next/navigation";
import ForwardComposer from "./ForwardComposer";
import { useForwardStore } from "@/stores/useForwardStore";

export default function ForwardHeader() {
  const router = useRouter();
  const [isSelect, setIsSelect] = useState(false);
  const clearMessages = useForwardStore((state) => state.clearMessages);

  const handleCancel = () => {
    clearMessages();
    router.back();
  };
  return (
    <>
      {/* Header + Search */}
      <div className="bg-gray-100 dark:bg-black pt-2">
        <div className="flex justify-between items-center px-4 py-1">
          <p
            className="text-blue-600 cursor-pointer hover:opacity-50 hover:scale-105 duration-500 transition-all ease-in-out"
            onClick={() => handleCancel()}
          >
            Cancel
          </p>
          <div
            className={`flex-1 flex justify-center ${
              !isSelect ? "" : "mr-[47px]"
            }`}
          >
            <p className="text-lg font-semibold">Forward</p>
          </div>
          {!isSelect && (
            <p
              className="text-blue-600 cursor-pointer hover:opacity-50 hover:scale-105 duration-500 transition-all ease-in-out"
              onClick={() => setIsSelect(true)}
            >
              Select
            </p>
          )}
        </div>

        <ForwardSearchBar />
        <p className="px-4 text-blue-600 py-1.5 text-sm">All chats</p>
        <div className="w-1/7 lg:w-1/26 bg-blue-600 h-0.5 mx-4 rounded-t-full"></div>
      </div>

      {/* Danh sách và composer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ForwardList isSelected={isSelect} />
        </div>
        <div className="border-t">{isSelect && <ForwardComposer />}</div>
      </div>
    </>
  );
}
