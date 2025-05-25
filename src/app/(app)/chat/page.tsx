"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import SearchBar from "@/app/components/SearchBar";
import { Fragment } from "react";

export default function ChatPage() {
  return (
    <Fragment>
      <div className="bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-blue-500">Edit</span>
          <h1 className="text-lg font-semibold">Chats</h1>
          <div className="flex gap-3">
            <div className="text-blue-500">+</div>
            <div className="text-blue-500">✏️</div>
          </div>
        </div>
        <SearchBar />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <Image
          src="/images/chicken.png"
          width={120}
          height={120}
          alt="no conversations"
          className="mb-4"
        />
        <p className="text-sm text-white">
          You have no{"\n"}conversations yet.
        </p>
      </div>
      <div className="px-6 py-4">
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base rounded-xl">
          New Message
        </Button>
      </div>
    </Fragment>
  );
}
