"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";

export default function ChatPage() {
  return (
    <>
      <div className="sticky bg-white dark:bg-black top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-blue-500">Edit</span>
          <h1 className="text-md font-semibold">Chats</h1>
          <div className="flex gap-3">
            <div className="text-blue-500">+</div>
            <div className="text-blue-500">✏️</div>
          </div>
        </div>
        <SearchBar />
      </div>
      <ScrollArea>
        {/* <div className="flex flex-1 flex-col justify-between min-h-[calc(100vh-112px)] pb-8">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Image
              src="/images/chicken.png"
              width={200}
              height={200}
              alt="no conversations"
              className=""
            />
            <p className="text-sm text-white whitespace-pre-line">
              You have no{"\n"}conversations yet.
            </p>
          </div>
          <div className="w-full pb-6 px-15">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 
            text-white text-base rounded-lg py-6 cursor-pointer"
            >
              <Link href={"/chat/newMessage"}>New Message</Link>
            </Button>
          </div>
        </div> */}

        <div className="flex flex-col px-2 pb-[64px] spacy-y-2">
          <ChatList />
        </div>
      </ScrollArea>
    </>
  );
}
