import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const ChatHeader = () => {
  return (
    <>
      <div
        className="flex justify-between bg-[#1c1c1e]
      py-2 items-center px-2"
      >
        <Link
          href={"/chat"}
          className="flex text-blue-600
        cursor-pointer hover:opacity-70"
        >
          <ChevronLeft />
          <p>Back</p>
        </Link>
        <div className="text-center">
          <h1 className="font-semibold text-base">Nhóm</h1>
          <p className="text-sm text-muted-foreground">1 member</p>
        </div>
        <div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Nhom" />
            <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
              N
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
