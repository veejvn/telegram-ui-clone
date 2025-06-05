import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const Page = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background cố định */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/7d/87/0e/7d870e07f3d5e3c4172c40e6f15e1498.jpg')",
        }}
        aria-hidden="true"
      />

      {/* Nội dung có thể scroll */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header cố định */}
        <div className="sticky top-0 z-20">
          <ChatHeader />
        </div>

        {/* Chat content scrollable */}
        <ScrollArea className="flex-1 min-h-0 px-4 space-y-1">
          <ChatMessages />
        </ScrollArea>

        <ChatComposer />
      </div>
    </div>
  );
};

export default Page;
