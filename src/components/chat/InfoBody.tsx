"use client";

import React from "react";
import * as sdk from "matrix-js-sdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { callService } from "@/services/callService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useChatStore } from "@/stores/useChatStore";
import {
  CallIcon,
  VideoIcon,
  MuteIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/chat/icons/InfoIcons";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import { usePresenceContext } from "@/contexts/PresenceProvider";
import { useIgnoreStore } from "@/stores/useIgnoreStore";

export default function InfoBody({ user }: { user: sdk.User }) {
  const client = useMatrixClient();
  const router = useRouter();

  const { getLastSeen } = usePresenceContext() || {};
  const lastSeen =
    user?.userId && getLastSeen ? getLastSeen(user.userId) : null;

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

    await callService.placeCall(roomId, type);
    router.push(
      `/call/${type}?calleeId=${encodeURIComponent(
        roomId
      )}&contact=${encodeURIComponent(user.userId)}`
    );
  };

  // 👉 LẤY TOÀN BỘ TIN NHẮN TỪ STORE
  const messagesByRoom = useChatStore((state) => state.messagesByRoom);

  // Get the roomId for the direct chat with this user
  const roomId =
    client
      ?.getRooms()
      .find(
        (room: sdk.Room) =>
          room.getJoinedMemberCount() === 2 &&
          room.getJoinedMembers().some((m) => m.userId === user.userId)
      )?.roomId || "";

  const roomMessages = messagesByRoom[roomId] || [];
  const imageMessages = [...roomMessages]
    .filter((msg) => msg.type === "image" && msg.imageUrl)
    .sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));

  const linkMessages = [...roomMessages]
    .filter(
      (msg) =>
        msg.type === "text" &&
        /(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i.test(
          msg.text
        )
    )
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // State cho block modal và trạng thái block
  const [showBlockModal, setShowBlockModal] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);

  // State cho xác nhận unblock
  const [showConfirmUnblock, setShowConfirmUnblock] = React.useState(false);

  // Kiểm tra user đã bị block chưa khi load component
  React.useEffect(() => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];
    setIsBlocked(ignored.includes(user.userId));
    useIgnoreStore.getState().setIgnoredUsers(ignored); // Đồng bộ store
  }, [client, user?.userId]);

  // Hàm block user
  const handleBlockUser = async () => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];

    if (!ignored.includes(user.userId)) {
      const updatedIgnored = [...ignored, user.userId];

      await client.setIgnoredUsers(updatedIgnored);
      setIsBlocked(true);

      // Cập nhật Zustand store
      useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
    }

    setShowBlockModal(false);
  };

  // Hàm unblock user
  const handleUnblockUser = async () => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];

    const updatedIgnored = ignored.filter((id: string) => id !== user.userId);
    await client.setIgnoredUsers(updatedIgnored);
    setIsBlocked(false);

    // ✅ Cập nhật Zustand store
    useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
  };

  return (
    <>
      <div className="text-center px-4">
        <p className="text-xl font-semibold">{user.displayName}</p>

        <p className="text-sm text-muted-foreground">
          {getDetailedStatus(lastSeen)}
        </p>

        <div className="flex justify-center gap-2 my-4 ">
          <div
            className="flex flex-col justify-end gap-0.5 items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-[#232329] rounded-lg py-1 group"
            onClick={() => handleStartCall("voice")}
          >
            <CallIcon />
            <p className="text-xs text-[#155dfc]">call</p>
          </div>

          <div
            className="flex flex-col justify-end items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-[#232329] rounded-lg py-1 group"
            onClick={() => handleStartCall("video")}
          >
            <VideoIcon />
            <p className="text-xs text-[#155dfc]">video</p>
          </div>

          <div className="flex flex-col justify-end items-center w-[75px] h-[50px] group cursor-pointer bg-white dark:bg-[#232329] rounded-lg py-1">
            <MuteIcon />
            <p className="text-xs text-[#155dfc]">mute</p>
          </div>

          <div className="flex flex-col justify-end items-center group cursor-pointer bg-white dark:bg-[#232329] rounded-lg w-[75px] h-[50px] py-1">
            <SearchIcon />
            <p className="text-xs text-[#155dfc]">search</p>
          </div>

          <Popover>
            <PopoverTrigger>
              <div className="flex flex-col justify-end items-center group cursor-pointer bg-white dark:bg-[#232329] rounded-lg w-[75px] h-[50px] py-1">
                <MoreIcon />
                <p className="text-xs text-[#155dfc]">more</p>
              </div>
            </PopoverTrigger>
            <PopoverContent className="mr-4 p-0 w-[240px]">
              <div className="">
                <Button
                  className="flex justify-between items-center w-full my-1 text-red-500 bg-white dark:bg-black"
                  onClick={() => setShowBlockModal(true)}
                  disabled={isBlocked}
                >
                  Block User
                  <Hand />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-white dark:bg-[#232329] ps-5 text-start py-4 flex flex-col mt-7 rounded-lg gap-1">
          <div>
            <p className="text-sm">mobile</p>
            <p className="text-[#155dfc] bg-white dark:bg-[#232329]">
              +84 11 222 33 44
            </p>
          </div>
          {isBlocked && (
            <div className="flex flex-col gap-3">
              <hr className="my-0.5 border-gray-200/50" />
              <button
                onClick={() => setShowConfirmUnblock(true)}
                className="text-[#155dfc] text-base font-normal py-0 cursor-pointer text-left"
              >
                Unblock
              </button>
            </div>
          )}
        </div>

        <div className="w-full text-start py-4 flex flex-col rounded-lg gap-0">
          <Tabs defaultValue="media">
            {/* Tabs header */}
            <div className="w-full">
              <TabsList className="w-full h-12 px-0 bg-white dark:bg-[#232329] rounded-none border-none shadow-none flex relative">
                <TabsTrigger
                  value="media"
                  className="group flex-1 h-12 rounded-none border-none shadow-none bg-transparent text-zinc-500 data-[state=active]:text-[#155dfc] data-[state=active]:font-semibold relative"
                >
                  Media
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#155dfc] opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="group flex-1 h-12 rounded-none border-none shadow-none bg-transparent text-zinc-500 data-[state=active]:text-[#155dfc] data-[state=active]:font-semibold relative"
                >
                  Links
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#155dfc] opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs content */}
            <TabsContent value="media">
              <div className="grid grid-cols-3 gap-0.5 bg-white dark:bg-black p-1 rounded-lg">
                {imageMessages.map((msg, idx) => (
                  <div key={msg.eventId || idx}>
                    <Image
                      src={msg.imageUrl ?? ""}
                      alt="media"
                      width={500}
                      height={500}
                      className="rounded object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="link">
              <Card className="w-full max-w-md mx-auto bg-white dark:bg-black shadow-sm pt-3 pb-0">
                <CardContent className="px-2">
                  <div className="space-y-4">
                    {linkMessages
                      .map((msg) => {
                        const match = msg.text.match(
                          /(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i
                        );
                        const rawUrl = match?.[0];
                        const url = rawUrl?.startsWith("http")
                          ? rawUrl
                          : `https://${rawUrl}`;
                        return url ? { ...msg, parsedUrl: url } : null;
                      })
                      .filter(
                        (msg): msg is { parsedUrl: string } & typeof msg =>
                          !!msg
                      )
                      .map((msg, index) => (
                        <div key={index} className="mb-2">
                          <a
                            href={msg.parsedUrl}
                            className="text-blue-500 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {msg.parsedUrl}
                          </a>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal xác nhận block user */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-md rounded-t-2xl bg-white dark:bg-[#23232b] p-6 pb-4">
            <p className="text-center text-base text-zinc-700 dark:text-zinc-200 mb-6">
              Do you want to block <b>{user.displayName || user.userId}</b> from
              messaging and calling you on Hii Chat?
            </p>
            <button
              className="w-full py-3 text-lg font-semibold text-red-600 bg-white dark:bg-[#23232b] rounded-xl mb-2 border border-red-200"
              onClick={handleBlockUser}
            >
              Block {user.displayName || user.userId}
            </button>
            <button
              className="w-full py-3 text-lg font-semibold text-blue-600 bg-white dark:bg-[#23232b] rounded-xl"
              onClick={() => setShowBlockModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Modal xác nhận unblock user */}
      {showConfirmUnblock && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#23232b] w-80 rounded-2xl p-5 shadow-xl text-center">
            <p className="text-lg font-medium text-black dark:text-white mb-6">
              Unblock <b>{user.displayName || user.userId}</b>?
            </p>
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setShowConfirmUnblock(false)}
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white 
      hover:border-[#155dfc] hover:bg-[#f0f6ff] focus:outline-none"
              >
                No
              </button>
              <button
                onClick={async () => {
                  await handleUnblockUser();
                  setShowConfirmUnblock(false);
                }}
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white 
      hover:border-[#155dfc] hover:bg-[#f0f6ff] focus:outline-none"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
