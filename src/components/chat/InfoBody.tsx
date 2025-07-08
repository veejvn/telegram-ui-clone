"use client";

import React from "react";
import * as sdk from "matrix-js-sdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Ellipsis, Hand, Phone, Search, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { callService } from "@/services/callService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

const mediaItems = [
  {
    id: 1,
    name: "Youtube",
    url: "http://youtube.com",
    icon: "Y",
    bgColor: "bg-gray-100",
  },
  {
    id: 2,
    name: "Google",
    url: "http://google.com",
    icon: "G",
    bgColor: "bg-gray-100",
  },
  {
    id: 3,
    name: "Matrix",
    url: "http://Matrix.org",
    icon: "M",
    bgColor: "bg-gray-100",
  },
];

export default function InfoBody({ user }: { user: sdk.User }) {
  const client = useMatrixClient();
  const router = useRouter();

  const ensureRoomExists = async (): Promise<string | null> => {
    const existingRoom = client
      ?.getRooms()
      .find(
        (room: sdk.Room) =>
          room.getJoinedMemberCount() === 2 &&
          room.getJoinedMembers().some((m) => m.userId === user.userId)
      );
    if (existingRoom) return existingRoom.roomId;

    try {
      const res = await client?.createRoom({
        invite: [user.userId],
        is_direct: true,
      });
      return res?.room_id || null;
    } catch (err) {
      console.error("Failed to create room:", err);
      return null;
    }
  };

  const handleStartCall = async (type: "voice" | "video") => {
    const roomId = await ensureRoomExists();
    if (!roomId) return;

    // ✅ Gọi mới
    await callService.placeCall(roomId, type);

    // ✅ Điều hướng đến trang call
    router.push(
      `/call/${type}?calleeId=${encodeURIComponent(
        roomId
      )}&contact=${encodeURIComponent(user.userId)}`
    );
  };

  return (
    <>
      <div className="text-center px-4">
        <p className="text-xl font-semibold">{user.displayName}</p>

        <p className="text-sm text-muted-foreground">last seen 27/02/25</p>

        <div className="flex justify-center gap-2 my-4">
          <div
            className="flex flex-col justify-end gap-0.5 items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-black rounded-lg py-1 group"
            onClick={() => handleStartCall("voice")}
          >
            <Phone className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">call</p>
          </div>

          <div
            className="flex flex-col justify-end items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-black rounded-lg py-1 group"
            onClick={() => handleStartCall("video")}
          >
            <Video className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">video</p>
          </div>

          <div className="flex flex-col justify-end items-center w-[75px] h-[50px] group cursor-pointer bg-white dark:bg-black rounded-lg py-1">
            <Bell className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">mute</p>
          </div>

          <div className="flex flex-col justify-end items-center group cursor-pointer bg-white dark:bg-black rounded-lg w-[75px] h-[50px] py-1">
            <Search className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">search</p>
          </div>

          <Popover>
            <PopoverTrigger>
              <div className="flex flex-col justify-end items-center group cursor-pointer bg-white dark:bg-black rounded-lg w-[75px] h-[50px] py-1">
                <Ellipsis className="text-[#155dfc]" />
                <p className="text-xs text-[#155dfc]">more</p>
              </div>
            </PopoverTrigger>
            <PopoverContent className="mr-4 p-0 w-[240px]">
              <div className="">
                <Button className="flex justify-between items-center w-full my-1 text-red-500 bg-white dark:bg-black">
                  Block User
                  <Hand />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-white dark:bg-black ps-5 text-start py-4 flex flex-col mt-7 rounded-lg gap-3">
          <div>
            <p className="text-sm">mobile</p>
            <p className="text-[#155dfc] dark:bg-black">+84 11 222 33 44</p>
          </div>
        </div>

        <div className="text-start py-4 flex flex-col rounded-lg gap-3">
          <Tabs defaultValue="media">
            <TabsList className="w-full h-12">
              <TabsTrigger
                value="media"
                className="data-[state=active]:text-[#155dfc] text-zinc-500"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="data-[state=active]:text-[#155dfc] text-zinc-500"
              >
                Links
              </TabsTrigger>
            </TabsList>
            <TabsContent value="media">
              <div className="grid grid-cols-3 gap-0.5 bg-white dark:bg-black p-1 rounded-lg">
                <div>
                  <Image
                    src="/chat/images/folder.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
                <div>
                  <Image
                    src="/chat/images/contact.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
                <div>
                  <Image
                    src="/chat/images/logo.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
                <div>
                  <Image
                    src="/chat/images/logo.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
                <div>
                  <Image
                    src="/chat/images/contact.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
                <div>
                  <Image
                    src="/chat/images/folder.png"
                    alt="image"
                    width={500}
                    height={500}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="link">
              <Card className="w-full max-w-md mx-auto bg-white dark:bg-black shadow-sm pt-3 pb-0">
                <CardContent className="px-2">
                  <div className="space-y-4">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div
                          className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-gray-600 font-semibold text-lg">
                            {item.icon}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium text-sm">
                            {item.name}
                          </span>
                          <a
                            href={item.url}
                            className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
