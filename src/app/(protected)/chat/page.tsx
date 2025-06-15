"use client";

import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserRooms } from "@/services/chatService";
import { useClientStore } from "@/stores/useClientStore";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRoomStore } from "@/stores/useRoomStore";

export default function ChatPage() {
  const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const client = useMatrixClient();

  useEffect(() => {
    if (!client) return;
    getUserRooms(client)
      .then((res) => {
        if (res.success && res.rooms) {
          setRooms(res.rooms);
        } else {
          console.error("Failed to fetch user rooms or rooms are undefined.");
        }
      })
      .catch((error) => {
        console.error("An error occurred while fetching user rooms:", error);
      });
  }, [client]);

  return (
    <div>
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

      {!rooms ? (
        <div className="flex flex-1 flex-col justify-between min-h-[calc(100vh-112px)] pb-8">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <img
              src="https://symbl-cdn.com/i/webp/97/613a80b3ab97dad9149e2b43f6112d.webp"
              width={100}
              height={100}
              alt="no conversations"
              className="mb-2"
            />
            <p className="text-sm whitespace-pre-line">
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
        </div>
      ) : (
        <ScrollArea tabIndex={-1}>
          <div className="flex flex-col px-2 pb-[64px] spacy-y-2">
            <ChatList rooms={rooms} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
