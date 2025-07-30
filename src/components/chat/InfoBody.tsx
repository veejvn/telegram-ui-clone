"use client";

import React, { useState, useEffect, useRef } from "react";
import * as sdk from "matrix-js-sdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { callService } from "@/services/callService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
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
export default function InfoBody({
  user,
  onScroll,
  maxHeaderHeight = 300,
  hideAvatarHeader = false,
}: {
  user: sdk.User;
  onScroll?: (position: number) => void;
  maxHeaderHeight?: number;
  hideAvatarHeader?: boolean;
}) {
  const client = useMatrixClient();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  let lastSeen = null;
  if (client) {
    lastSeen = useUserPresence(client, user?.userId ?? "").lastSeen;
  }
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
  useEffect(() => {
    // Xử lý hiển thị/ẩn header mini avatar khi scroll
    const handleHeaderAvatar = () => {
      const miniHeader = document.querySelector(".header-mini-avatar");
      const miniName = document.querySelector(".header-mini-name");

      if (miniHeader && miniName) {
        if (scrollPosition > 0) {
          // Ẩn avatar nhỏ và tên ở header khi scroll
          miniHeader.classList.add("opacity-0", "invisible");
          miniName.classList.add("opacity-0", "invisible");
        } else {
          // Hiện avatar nhỏ và tên khi không scroll
          miniHeader.classList.remove("opacity-0", "invisible");
          miniName.classList.remove("opacity-0", "invisible");
        }
      }
    };


    handleHeaderAvatar();
  }, [scrollPosition]);


    handleHeaderAvatar();
  }, [scrollPosition]);
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
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  // Trong useEffect xử lý scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const position = scrollContainer.scrollTop;
      const threshold = 5;

      // Cập nhật scrollPosition
      if (position >= threshold) {
        setScrollPosition(maxHeaderHeight);
        // Thay đổi màu nền container khi scroll
        scrollContainer.style.backgroundColor = "black";
        // Thêm class cho container để thay đổi style khi scroll
        scrollContainer.classList.add("scrolled");
      } else {
        setScrollPosition(0);
        // Khôi phục màu nền khi không scroll
        scrollContainer.style.backgroundColor = "";
        // Xóa class khi không scroll
        scrollContainer.classList.remove("scrolled");
      }


      // Báo cho component cha
      if (onScroll) onScroll(position >= threshold ? maxHeaderHeight : 0);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [onScroll, maxHeaderHeight]);
  React.useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.avatarUrl || !client) return;
      try {
        const httpUrl = client.mxcUrlToHttp(
          user.avatarUrl,
          1200,
          1200,
          "scale",
          true
        );
        setAvatarUrl(httpUrl);
      } catch {
        setAvatarUrl(null);
      }
    };
    fetchAvatar();
  }, [client, user]);
  // LẤY TOÀN BỘ TIN NHẮN TỪ STORE
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

  const roomMessages = messagesByRoom[roomId] || [];

  const mediaMessages = [...roomMessages]
    .filter(
      (msg) =>
        (msg.type === "image" && msg.imageUrl) ||
        (msg.type === "video" && msg.videoUrl)
    )
    .sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));
  // ...existing code...
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
  const voiceMessages = [...roomMessages]
    .filter((msg) => {
      return msg.type === "audio" && msg.audioUrl;
    })
    .sort((a, b) => (b.timestamp || Date.now()) - (a.timestamp || Date.now()));
  type VoiceMessage = {
    eventId?: string;
    senderDisplayName?: string;
    sender?: string;
    audioUrl?: string;
    audioDuration?: number;
    timestamp?: number;
    [key: string]: any;
  };

  const groupMessages: any[] = [];
  // Thêm vào đầu component
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
  const calculateHeaderStyle = () => {
    // Thay đổi này: Biến đổi nhanh hơn, ngay khi có scroll
    const scrollRatio = scrollPosition > 0 ? 1 : 0;

    // Giá trị cố định cho các trạng thái
    const minHeight = 100; // Tăng chiều cao cho avatar khi scroll
    const height = scrollRatio > 0 ? minHeight : maxHeaderHeight;

    // Kích thước avatar - giữ avatar lớn hơn khi scroll
    const scale = scrollRatio > 0 ? 0.9 : 1; // Ít thu nhỏ hơn khi scroll
    const opacity = scrollRatio > 0 ? 0 : 1; // Ẩn text khi scroll

    // Biến đổi thành hình tròn ngay lập tức
    const borderRadius = scrollRatio > 0 ? 50 : 0; // 50% = hình tròn

    // Kích thước cố định khi scroll - để avatar nằm giữa và lớn hơn
    const finalWidth = minHeight; // Chiều rộng bằng chiều cao khi thu nhỏ

    return {
      height: `${height}px`,
      width: scrollRatio > 0 ? `${finalWidth}px` : "100%",
      // Remove 'scale' property, not valid in style object
      opacity: opacity,
      transform: scrollRatio > 0 ? "scale(0.9)" : "scale(1)",
      transformOrigin: "center top",
      borderRadius: `${borderRadius}%`,
      // Căn giữa avatar khi scroll
      marginLeft: scrollRatio > 0 ? "auto" : "0",
      marginRight: scrollRatio > 0 ? "auto" : "0",
      position: scrollRatio > 0 ? "relative" : undefined, // Only valid values
      top: scrollRatio > 0 ? "0" : undefined, // Điều chỉnh vị trí avatar khi scroll
    };
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
  const [pullDownDistance, setPullDownDistance] = useState(0);
  const touchStartY = useRef(0);
  const touchingScreen = useRef(false);
  // Handle touch start
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchingScreen.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchingScreen.current) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY.current;

      // Only apply pull-down effect when at top of scroll
      if (scrollContainer.scrollTop <= 0 && deltaY > 0) {
        // Use non-linear transformation for more natural feel
        // The more you pull, the harder it gets
        const resistance = 0.4;
        const distance = Math.min(deltaY * resistance, maxHeaderHeight);
        setPullDownDistance(distance);
        e.preventDefault();
      } else {
        setPullDownDistance(0);
      }
    };

    const handleTouchEnd = () => {
      // Reset when touch ends
      touchingScreen.current = false;
      if (pullDownDistance > 0) {
        setPullDownDistance(0);
      }
    };

    scrollContainer.addEventListener("touchstart", handleTouchStart);
    scrollContainer.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    scrollContainer.addEventListener("touchend", handleTouchEnd);

    return () => {
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", handleTouchMove);
      scrollContainer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [maxHeaderHeight, pullDownDistance]);

  // Then in the avatar container:
  const avatarContainerStyle = {
    ...calculateHeaderStyle(),
    height:
      pullDownDistance > 0
        ? `${maxHeaderHeight + pullDownDistance}px`
        : calculateHeaderStyle().height,
    transform:
      pullDownDistance > 0
        ? `scale(${1 + (pullDownDistance / maxHeaderHeight) * 0.2})`
        : calculateHeaderStyle().transform,
    transition: "all 0.3s ease-out", // Thêm transition mượt mà
  };


  const imageStyle = {
    borderRadius: calculateHeaderStyle().borderRadius + "%",
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "all 0.3s ease-out", // Thêm transition mượt mà
  };
  const actionButtonsStyle = {
    position: "relative" as React.CSSProperties["position"],
    marginTop: scrollPosition > 0 ? "20px" : "0", // Giảm khoảng cách
    display: "flex",
    justifyContent: "center",
    width: "100%",
    padding: "0 16px",
    backgroundColor: scrollPosition > 0 ? "black" : "transparent", // Thêm màu nền đen
    paddingBottom: scrollPosition > 0 ? "20px" : "0", // Thêm padding dưới khi scroll
  };
  const scrolledButtonStyle = {
    backgroundColor: "white",
    color: "#155dfc",
    borderRadius: "12px",
    marginHorizontal: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };


  const imageStyle = {
    borderRadius: calculateHeaderStyle().borderRadius + "%",
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "all 0.3s ease-out", // Thêm transition mượt mà
  };
  const actionButtonsStyle = {
    position: "relative" as React.CSSProperties["position"],
    marginTop: scrollPosition > 0 ? "20px" : "0", // Giảm khoảng cách
    display: "flex",
    justifyContent: "center",
    width: "100%",
    padding: "0 16px",
    backgroundColor: scrollPosition > 0 ? "black" : "transparent", // Thêm màu nền đen
    paddingBottom: scrollPosition > 0 ? "20px" : "0", // Thêm padding dưới khi scroll
  };
  const scrolledButtonStyle = {
    backgroundColor: "white",
    color: "#155dfc",
    borderRadius: "12px",
    marginHorizontal: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };
  return (
    <>
      <div
        ref={scrollContainerRef}
        className="relative flex flex-col overflow-y-auto overscroll-none bg-white dark:bg-black h-full pb-0"
      >
        {/* Container chính bao gồm avatar và các nút bấm */}
        <div
          className={`relative ${
            scrollPosition > 0 ? "bg-white/90 dark:bg-black" : ""
          }`}
          style={{
            height: scrollPosition > 0 ? "280px" : "auto",
            transition: "height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)", // Thêm cubic-bezier cho animation mượt hơn
          }}
        >
          {/* Avatar container */}
          {!hideAvatarHeader &&
            (avatarUrl ? (
              <div
                className={`${
                  scrollPosition > 0
                    ? "absolute left-1/2 transform -translate-x-1/2 top-10"
                    : "relative flex flex-col items-center"
                } transition-all duration-300 ease-out z-10`}
                style={{
                  width: scrollPosition > 0 ? "110px" : "100%",
                  height: scrollPosition > 0 ? "110px" : `${maxHeaderHeight}px`,
                  borderRadius: scrollPosition > 0 ? "50%" : "0",
                  overflow: "hidden",
                  transition: "all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0)", // Dùng cubic-bezier thay vì ease-out
                }}
              >
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="object-cover w-full h-full"
                  style={{
                    transition: "all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0)", // Thời gian transition cao hơn và dùng cubic-bezier
                  }}
                />


                {/* Chỉ hiển thị gradient background và tên nếu không scroll */}
                {scrollPosition === 0 && (
                  <div className="absolute inset-0 flex flex-col justify-end px-4 pb-16 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xl font-semibold text-white">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-white mb-4">
                      {isActuallyOnline
                        ? "online"
                        : getDetailedStatus(lastSeen)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`${
                  scrollPosition > 0 ? "relative" : "relative"
                } bg-gray-200 dark:bg-black`}
                style={{
                  width: "100%",
                  height: scrollPosition > 0 ? "280px" : `${maxHeaderHeight}px`,
                }}
              >
                {/* Avatar mặc định - áp dụng style tương tự avatar có URL */}
                <div
                  className={`${
                    scrollPosition > 0
                      ? "absolute left-1/2 transform -translate-x-1/2 top-10"
                      : "flex flex-col items-center justify-center pt-6"
                  } transition-all duration-300 ease-out z-10`}
                >
                  <div
                    className={`${
                      scrollPosition > 0 ? "h-28 w-28" : "h-28 w-28"
                    } rounded-full bg-purple-400 text-white text-5xl font-bold flex items-center justify-center transition-all duration-300 ease-out`}
                  >
                    {user.displayName?.slice(0, 1)}
                  </div>

                  {/* Tên và trạng thái - hiển thị giữa màn hình */}
                  <div
                    className={`text-center mt-3 ${
                      scrollPosition > 0 ? "hidden" : "block"
                    }`}
                  >
                    <p className="text-xl font-semibold text-black dark:text-white">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-white">
                      {isActuallyOnline
                        ? "online"
                        : getDetailedStatus(lastSeen)}
                    </p>
                  </div>
                </div>

                {/* Tên và trạng thái khi scroll */}
                {scrollPosition > 0 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-[150px] text-center w-full">
                    <p className="text-lg font-semibold dark:text-white text-gray-800">
                      {user.displayName}
                    </p>
                    <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                      {isActuallyOnline
                        ? "online"
                        : getDetailedStatus(lastSeen)}
                    </p>
                  </div>
                )}
              </div>
            ))}

          {/* Action buttons cho avatar mặc định - sử dụng CSS giống khi đã scroll */}
          {scrollPosition === 0 && !avatarUrl && (
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
              <div className="grid grid-cols-5 gap-2 w-full max-w-md mx-auto">
                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-white"
                  onClick={() => handleStartCall("voice")}
                >
                  <CallIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">call</p>
                </div>

                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-white"
                  onClick={() => handleStartCall("video")}
                >
                  <VideoIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">video</p>
                </div>


                <div className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-white">
                  <MuteButton onMuteUntil={handleMuteUntil} roomId={roomId} />
                </div>

                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-white"
                  onClick={() => router.push(`/chat/${roomId}?searching=true`)}
                >
                  <SearchIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">search</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-white">
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
            </div>
          )}

          {/* Action buttons cho avatar URL (giữ nguyên style cũ) */}
          {scrollPosition === 0 && avatarUrl && (
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
              <div className="grid grid-cols-5 gap-2 w-full">
                <div
                  className="flex flex-col justify-end gap-0.5 items-center cursor-pointer py-3 rounded-lg dark:bg-black/40 bg-gray-300/60"
                  onClick={() => handleStartCall("voice")}
                >
                  <CallIcon />
                  <p className="text-xs text-[#155dfc]">call</p>
                </div>

                <div
                  className="flex flex-col justify-end gap-0.5 items-center cursor-pointer py-3 rounded-lg dark:bg-black/40 bg-gray-300/60"
                  onClick={() => handleStartCall("video")}
                >
                  <VideoIcon />
                  <p className="text-xs text-[#155dfc]">video</p>
                </div>

                <div className="flex flex-col justify-end gap-0.5 items-center cursor-pointer py-3 rounded-lg dark:bg-black/40 bg-gray-300/60">
                  <MuteButton onMuteUntil={handleMuteUntil} roomId={roomId} />
                </div>

                <div
                  className="flex flex-col justify-end gap-0.5 items-center cursor-pointer py-3 rounded-lg dark:bg-black/40 bg-gray-300/60"
                  onClick={() => router.push(`/chat/${roomId}?searching=true`)}
                >
                  <SearchIcon />
                  <p className="text-xs text-[#155dfc]">search</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-black/40 bg-gray-300/60">
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
            </div>
          )}

          {/* Hiển thị tên và trạng thái ở giữa avatar và nút */}
          {scrollPosition > 0 && avatarUrl && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[145px] text-center w-full z-20">
              <p className="text-lg font-semibold dark:text-white text-gray-800">
                {user.displayName}
              </p>
              <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                {isActuallyOnline ? "online" : getDetailedStatus(lastSeen)}
              </p>
            </div>
          )}

          {/* Đưa cụm nút hành động xuống sát đáy phần đen */}
          {scrollPosition > 0 && avatarUrl && (
            <div className="absolute bottom-3 left-0 right-0 px-3 z-20">
              <div className="grid grid-cols-5 gap-2 w-full max-w-md mx-auto">
                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-gray-200/80"
                  onClick={() => handleStartCall("voice")}
                >
                  <CallIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">call</p>
                </div>

                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-gray-200/80"
                  onClick={() => handleStartCall("video")}
                >
                  <VideoIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">video</p>
                </div>

                <div className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-gray-200/80">
                  <MuteButton onMuteUntil={handleMuteUntil} roomId={roomId} />
                </div>

                <div
                  className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-gray-200/80"
                  onClick={() => router.push(`/chat/${roomId}?searching=true`)}
                >
                  <SearchIcon />
                  <p className="text-xs mt-1 text-[#155dfc]">search</p>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col justify-center items-center cursor-pointer py-3 rounded-lg dark:bg-[#33333a] bg-gray-200/80">
                      <MoreIcon />
                      <p className="text-xs text-[#155dfc]">more</p>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="mr-4 p-0 w-[240px]">
                    <Button
                      className="flex justify-between items-center w-full my-1 text-red-500 bg-white dark:bg-black"
                      onClick={() => setShowBlockModal(true)}
                      disabled={isBlocked}
                    >
                      Block User
                      <Hand />
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* User info section */}

        {!hideAvatarHeader && (
          <div className="w-full px-4 bg-white dark:bg-black">
            <div
              className={`w-full max-w-md mx-auto bg-white dark:bg-[#232329] px-4 py-2 text-start flex flex-col mb-2 ${
                scrollPosition > 0 ? "rounded-none" : "mt-4"
              } gap-2 shadow-sm border border-gray-200 dark:border-[#3a3b3d] rounded-xl`}
            >
              <div>
                <p className="text-sm text-zinc-500">mobile</p>
                <p className="text-[#155dfc] break-all">+84 91 502 70 46</p>
              </div>

              <div className="w-full h-[1px] bg-gray-200 dark:bg-[#3a3b3d]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">username</p>
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

              {isBlocked && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="w-full h-[1px] bg-gray-200 dark:bg-[#3a3b3d]" />
                  <button
                    onClick={() => setShowConfirmUnblock(true)}
                    className="text-[#155dfc] text-base font-normal py-0 cursor-pointer text-left"
                  >
                    Unblock
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!hideAvatarHeader &&

          (mediaMessages.length > 0 ||
            linkMessages.length > 0 ||
            voiceMessages.length > 0 ||
            groupMessages.length > 0) && (
            <div className="bg-white dark:bg-black rounded-none flex-1 min-h-0 flex flex-col mt-0 relative">

              <Tabs
                defaultValue={
                  mediaMessages.length > 0
                    ? "media"
                    : linkMessages.length > 0
                    ? "link"
                    : voiceMessages.length > 0
                    ? "voice"
                    : "groups"
                }
                className="w-full h-full"
              >
                {(() => {
                  const visibleTabsCount =
                    (mediaMessages.length > 0 ? 1 : 0) +
                    (voiceMessages.length > 0 ? 1 : 0) +
                    (linkMessages.length > 0 ? 1 : 0) +
                    (groupMessages.length > 0 ? 1 : 0);

                  return (
                    <TabsList className="grid w-full grid-cols-4">
                      {mediaMessages.length > 0 && (
                        <TabsTrigger value="media" className="flex-1">
                          Media
                        </TabsTrigger>
                      )}
                      {voiceMessages.length > 0 && (
                        <TabsTrigger value="voice" className="flex-1">
                          Voice
                        </TabsTrigger>
                      )}
                      {linkMessages.length > 0 && (
                        <TabsTrigger value="link" className="flex-1">
                          Links
                        </TabsTrigger>
                      )}
                      {groupMessages.length > 0 && (
                        <TabsTrigger value="groups" className="flex-1">
                          Groups
                        </TabsTrigger>
                      )}
                    </TabsList>
                  );
                })()}

                {mediaMessages.length > 0 && (
                  <TabsContent value="media" className="h-full pb-0 mb-0">

                    <div className="h-full overflow-y-auto overscroll-contain pb-8 bg-white dark:bg-[#1c1c1e]">
                      {/* Thay đổi từ grid sang flex wrap để căn trái */}
                      <div className="flex flex-wrap gap-1 p-2 justify-start">
                        {mediaMessages.map((msg, idx) => (
                          <div
                            key={msg.eventId || idx}
                            className="w-[32%] aspect-square"
                          >
                            {msg.type === "image" && msg.imageUrl ? (
                              <Image
                                src={msg.imageUrl}
                                alt="media"
                                width={500}
                                height={500}
                                className="w-full h-full object-cover rounded"
                                priority
                              />
                            ) : msg.type === "video" && msg.videoUrl ? (
                              <video
                                src={msg.videoUrl}
                                controls
                                className="w-full h-full object-cover rounded bg-white"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
                {voiceMessages.length > 0 && (
                  <TabsContent value="voice" className="h-full pb-0 mb-0">
                    <div className="h-full overflow-y-auto overscroll-contain pb-4 bg-white dark:bg-[#1c1c1e]">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                        {voiceMessages.map((msg, idx) => (
                          <li
                            key={msg.eventId || idx}
                            className="flex items-center bg-gray-100 dark:bg-[#2c2c2e] p-4 m-2 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium dark:text-white">
                                  {msg.senderDisplayName === user.displayName
                                    ? "You"
                                    : msg.senderDisplayName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    msg.timestamp || 0
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    msg.timestamp || 0
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              <div className="mt-2 relative">
                                <audio
                                  id={`audio-${msg.eventId}`}
                                  src={msg.audioUrl || ""}
                                  preload="metadata"
                                  className="hidden"
                                  onTimeUpdate={(e) => {
                                    const target = e.target as HTMLAudioElement;
                                    const progress =
                                      (target.currentTime / target.duration) *
                                        100 || 0;
                                    const progressBar = document.getElementById(
                                      `progress-${msg.eventId}`
                                    );
                                    const timeDisplay = document.getElementById(
                                      `time-${msg.eventId}`
                                    );
                                    if (progressBar) {
                                      progressBar.style.width = `${progress}%`;
                                    }
                                    if (timeDisplay) {
                                      const currentMin = Math.floor(
                                        target.currentTime / 60
                                      );
                                      const currentSec = Math.floor(
                                        target.currentTime % 60
                                      );
                                      const durationMin = Math.floor(
                                        target.duration / 60
                                      );
                                      const durationSec = Math.floor(
                                        target.duration % 60
                                      );

                                      timeDisplay.textContent = `${currentMin}:${currentSec
                                        .toString()
                                        .padStart(
                                          2,
                                          "0"
                                        )} / ${durationMin}:${durationSec
                                        .toString()
                                        .padStart(2, "0")}`;
                                    }
                                  }}
                                />

                                {/* Player UI với 1 nút play duy nhất */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 hover:bg-blue-600 transition-colors"
                                    onClick={() => {
                                      const audio = document.getElementById(
                                        `audio-${msg.eventId}`
                                      ) as HTMLAudioElement;
                                      if (audio) {
                                        if (audio.paused) {
                                          document
                                            .querySelectorAll("audio")
                                            .forEach((a) => {
                                              if (
                                                a.id !== `audio-${msg.eventId}`
                                              )
                                                a.pause();
                                            });
                                          audio.play();
                                        } else {
                                          audio.pause();
                                        }
                                      }
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-white"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>

                                  <div className="flex-1">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                      <div
                                        id={`progress-${msg.eventId}`}
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{
                                          width: "0%",
                                          transition: "width 0.2s",
                                        }}
                                      ></div>
                                    </div>
                                    <p
                                      id={`time-${msg.eventId}`}
                                      className="text-xs text-gray-500 mt-1"
                                    >
                                      0:00 /{" "}
                                      {msg.audioDuration
                                        ? `${Math.floor(
                                            msg.audioDuration / 60
                                          )}:${String(
                                            Math.floor(msg.audioDuration % 60)
                                          ).padStart(2, "0")}`
                                        : "0:00"}
                                    </p>
                                  </div>

                                  <button
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => {
                                      const audio = document.getElementById(
                                        `audio-${msg.eventId}`
                                      ) as HTMLAudioElement;
                                      if (audio) {
                                        audio.muted = !audio.muted;
                                      }
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                )}

                {linkMessages.length > 0 && (
                  <TabsContent value="link" className="pb-0 mb-0">

                    <div className="max-h-[420px] overflow-y-auto overscroll-contain pb-0">
                      <Card className="w-full shadow-sm pt-3 pb-0 rounded-none">
                        <CardContent className="px-2 pb-10">
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


                {groupMessages.length > 0 && (
                  <TabsContent value="groups" className="pb-0 mb-0">
                    <div className="p-4 text-center text-muted-foreground">
                      Group messages content here.
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
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
              className="w-full py-3 text-lg font-semibold text-red-600 bg-white dark:bg-[#23232b] rounded-xl mb-2 border border-red-200 dark:border-red-800"
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
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white dark:bg-[#23232b] dark:border-[#444]
hover:border-[#155dfc] hover:bg-[#f0f6ff] dark:hover:bg-[#2a2a33] focus:outline-none"
              >
                No
              </button>
              <button
                onClick={async () => {
                  await handleUnblockUser();
                  setShowConfirmUnblock(false);
                }}
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white dark:bg-[#23232b] dark:border-[#444]
hover:border-[#155dfc] hover:bg-[#f0f6ff] dark:hover:bg-[#2a2a33] focus:outline-none"
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
