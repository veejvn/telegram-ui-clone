"use client";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClientStore } from "@/stores/useClientStore";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { setupAuthedClient } from "@/lib/matrix";

const Page = () => {
  const { theme } = useTheme();
  const param = useParams();
  const roomId = param.id?.slice(0, 19) + ":matrix.org";

  const client = useClientStore.getState().client;
  const [room, setRoom] = useState<sdk.Room | null>();

  useEffect(() => {
    const init = async () => {
      let currentClient = client;

      if (!currentClient) {
        const authed = await setupAuthedClient();
        if (!authed) return;
        currentClient = authed;
      }

      const foundRoom = currentClient.getRoom(roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      }
    };
    init();
  }, [roomId, client]);

  return room ? (
    <div className="relative h-screen overflow-hidden">
      {/* Background cố định */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={
          theme === "dark"
            ? {
                backgroundImage:
                  "url('https://i.pinimg.com/736x/7d/87/0e/7d870e07f3d5e3c4172c40e6f15e1498.jpg')",
              }
            : {
                backgroundImage:
                  "url('https://i.pinimg.com/736x/3d/8c/2f/3d8c2f2c82c1c9ef1e27be645cd1aa17.jpg')",
              }
        }
        aria-hidden="true"
      />

      {/* Nội dung có thể scroll */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header cố định */}
        <div className="sticky top-0 z-20">
          <ChatHeader room={room} />
        </div>

        {/* Chat content scrollable */}
        <ScrollArea className="flex-1 min-h-0 px-4 space-y-1">
          <ChatMessages roomId={roomId} />
        </ScrollArea>

        <ChatComposer roomId={roomId} />
      </div>
    </div>
  ) : null;
};

export default Page;
