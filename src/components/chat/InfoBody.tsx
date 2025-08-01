"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import {
  CallIcon,
  VideoIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/chat/icons/InfoIcons";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
// import { usePresenceContext } from "@/contexts/PresenceProvider";
import { useIgnoreStore } from "@/stores/useIgnoreStore";
import MuteButton from "./mute/MuteButton";
import { useUserPresence } from "@/hooks/useUserPrecense";
import LinkCard from "./LinkCard";
import { useTimeline } from "@/hooks/useTimeline";

export default function InfoBody({ user }: { user: sdk.User }) {
  const client = useMatrixClient();
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAvatar = async () => {
      if (!client || !user.avatarUrl) return;
      try {
        const httpUrl =
          client.mxcUrlToHttp(user.avatarUrl, 96, 96, "crop") ?? "";

        setAvatarUrl(httpUrl);
      } catch (error) {
        setAvatarUrl("");
        console.error("Error loading avatar:", error);
      }
    };

    fetchAvatar();
  }, [client]);

  const { lastSeen } = useUserPresence(client as any, user?.userId ?? "");
  const isActuallyOnline =
    lastSeen !== null && Date.now() - lastSeen.getTime() < 30 * 1000;

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
      )}&contact=${encodeURIComponent(user.displayName ?? user.userId)}`
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
  useTimeline(roomId);

  // 👉 LẤY TOÀN BỘ TIN NHẮN TỪ STORE
  const roomMessages = messagesByRoom[roomId] || [];
  const imageMessages = [...roomMessages]
    .filter((msg) => msg.type === "image" && msg.imageUrl)
    .sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));

  const linkMessages = [...roomMessages]
    .map((msg) => {
      if (msg.type !== "text" || !msg.sender) return null;

      let text = msg.text;

      // Nếu là JSON forward, thì parse ra text gốc
      try {
        const parsed = JSON.parse(msg.text);
        if (parsed.forward && parsed.text) {
          text = parsed.text;
        }
      } catch {
        // Không làm gì nếu không phải JSON
      }

      const isLink =
        /(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i.test(
          text
        );
      if (!isLink) return null;

      return {
        ...msg,
        text, // gán lại text là đoạn text thật sự cần render
      };
    })
    .filter(Boolean) // loại bỏ null
    .sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Hàm xử lý khi chọn ngày thành công từ MuteUntilPicker
  const handleMuteUntil = (date: Date) => {
    const formatted = `${date.toLocaleDateString("en-GB")} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    setToastMessage(`Notifications are muted until ${formatted}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

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
      <div className="flex flex-col overflow-hidden bg-transparent">
        <div className="text-center">
          <div className="mx-auto w-full max-w-xs bg-[#8080804D] rounded-2xl py-4 flex flex-col items-center gap-1">
            <Avatar className="w-24 h-24">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <AvatarFallback className="bg-purple-400 text-white text-5xl font-bold">
                  {user.displayName?.slice(0, 1)}
                </AvatarFallback>
              )}
            </Avatar>

            <p className="text-lg font-semibold mt-1">{user.displayName}</p>
            <p className="text-sm text-muted-foreground text-#6B7271">
              {isActuallyOnline ? "Online" : getDetailedStatus(lastSeen)}
            </p>
          </div>

          <div className="flex justify-center gap-3 px-4 py-2">
            {/* Call */}
            <div
              className="flex flex-col items-center w-[100px] h-[70px] bg-[#FFFFFF4D] rounded-xl justify-center cursor-pointer hover:scale-105 transition-all"
              onClick={() => handleStartCall("voice")}
            >
              <CallIcon className="text-[#155dfc] w-5 h-5 mb-1" />
              <p className="text-xs font-medium text-[#155dfc]">Call</p>
            </div>

            {/* Video */}
            <div
              className="flex flex-col items-center w-[100px] h-[70px] bg-[#FFFFFF4D] rounded-xl justify-center cursor-pointer hover:scale-105 transition-all"
              onClick={() => handleStartCall("video")}
            >
              <VideoIcon className="text-[#155dfc] w-5 h-5 mb-1" />
              <p className="text-xs font-medium text-[#155dfc]">Video</p>
            </div>

            {/* Mute */}
            <div className="flex flex-col items-center w-[100px] h-[70px] bg-[#FFFFFF4D] rounded-xl justify-center cursor-pointer hover:scale-105 transition-all">
              <MuteButton
                onMuteUntil={handleMuteUntil}
                roomId={roomId}
                className="text-[#155dfc] w-5 h-5 mb-1"
              />
            </div>
          </div>

          <div className="w-full max-w-[343px]  mx-auto bg-[#FFFFFF4D] px-4 py-2 text-start flex flex-col mt-4 mb-2 rounded-xl gap-0.5 shadow">
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Phone number
              </p>
              <p className="text-[#155dfc] break-all">+84 91 502 70 46</p>
            </div>

            <hr className="border-gray-300 dark:border-gray-600" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black dark:text-white">
                  Username
                </p>
                <p className="text-[#155dfc] break-all">
                  @{user.userId?.split(":")[0].replace(/^@/, "")}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#155dfc] cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect x="3" y="3" width="4" height="4" rx="1" />
                <rect x="17" y="3" width="4" height="4" rx="1" />
                <rect x="3" y="17" width="4" height="4" rx="1" />
                <rect x="17" y="17" width="4" height="4" rx="1" />
                <rect x="10" y="10" width="4" height="4" rx="1" />
              </svg>
            </div>

            <hr className="border-gray-300 dark:border-gray-600" />

            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Bio
              </p>
              <p className="text-sm text-#6B7271 dark:text-gray-300">
                Lorem ipsum dolor sit amet 🔥🍀🥇⚡
              </p>
            </div>

            {isBlocked && (
              <div className="flex flex-col gap-2 mt-2">
                <hr className="my-1 border-gray-200/50" />
                <button
                  onClick={() => setShowConfirmUnblock(true)}
                  className="text-[#155dfc] text-base font-normal py-0 cursor-pointer text-left"
                >
                  Unblock
                </button>
              </div>
            )}
          </div>

          {(imageMessages.length > 0 || linkMessages.length > 0) && (
            <div className="bg-transparent mt-2 rounded-none">
              <Tabs
                defaultValue={
                  imageMessages.length > 0
                    ? "media"
                    : linkMessages.length > 0
                    ? "link"
                    : "voice"
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  {imageMessages.length > 0 && (
                    <TabsTrigger value="media">Media</TabsTrigger>
                  )}
                  <TabsTrigger value="voice">Voice</TabsTrigger>
                  {linkMessages.length > 0 && (
                    <TabsTrigger value="link">Links</TabsTrigger>
                  )}
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                </TabsList>

                {imageMessages.length > 0 && (
                  <TabsContent value="media">
                    <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                      <div className="grid grid-cols-3 gap-0.5 p-1">
                        {imageMessages.map((msg, idx) => (
                          <div
                            key={msg.eventId || idx}
                            className="aspect-square"
                          >
                            <Image
                              src={msg.imageUrl ?? ""}
                              alt="media"
                              width={500}
                              height={500}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {linkMessages.length > 0 && (
                  <TabsContent value="link">
                    <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                      <Card className="w-full shadow-sm pt-3 pb-0 rounded-none">
                        <CardContent className="px-2">
                          <div className="space-y-4">
                            {linkMessages.map((msg, index) => {
                              if (!msg) return null;
                              const match = msg.text.match(
                                /(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i
                              );
                              const rawUrl = match?.[0];
                              const url = rawUrl?.startsWith("http")
                                ? rawUrl
                                : `https://${rawUrl}`;

                              return url ? (
                                <div key={msg.eventId || index}>
                                  <LinkCard url={url} title={msg.text} />
                                </div>
                              ) : null;
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                )}

                {/* TabsContent cho voice & groups */}
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận block user */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-md rounded-t-2xl bg-white dark:bg-[#23232b] p-6 pb-4">
            <p className="text-center text-base text-zinc-700 dark:text-zinc-200 mb-6">
              Do you want to block <b>{user.displayName || user.userId}</b> from
              messaging and calling you on Ting Tong Chat?
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

      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] bg-neutral-700 text-white text-sm px-4 py-2 rounded-2xl flex items-center space-x-2 z-[9999] shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="whitespace-nowrap">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
