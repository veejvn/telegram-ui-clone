"use client";

import React, { useState } from "react";
import * as sdk from "matrix-js-sdk";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Hand } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs, TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
// import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { callService } from "@/services/callService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import {
  CallIcon,
  VideoIcon,
  DocIcon,
  TxtIcon,
  SvgIcon,
  Mp4Icon,
  PdfIcon,
  AudioIcon,
} from "@/components/chat/icons/InfoIcons";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
// import { usePresenceContext } from "@/contexts/PresenceProvider";
import MuteButton from "./mute/MuteButton";
import { useUserPresence } from "@/hooks/useUserPrecense";
// import LinkCard from "./LinkCard";
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
  }, [client, user.avatarUrl]);

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

  // LẤY TOÀN BỘ TIN NHẮN TỪ STORE
  const roomMessages = messagesByRoom[roomId] || [];
  // Lọc tin nhắn file và log ra để kiểm tra cấu trúc
  const fileMessages = roomMessages.filter((msg) => msg.type === "file");

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
  // type VoiceMessage = {
  //   eventId?: string;
  //   senderDisplayName?: string;
  //   sender?: string;
  //   audioUrl?: string;
  //   audioDuration?: number;
  //   timestamp?: number;
  //   [key: string]: any;
  // };

  const groupMessages: any[] = [];

  const [activeTab, setActiveTab] = useState("media");

  function getFileInfo(msg: any) {
    const fileName =
      msg.fileName ||
      msg.body ||
      msg.text ||
      (msg.content && msg.content.filename) ||
      "Unknown file";
    const rawSize =
      msg.fileSize ||
      msg.size ||
      (msg.fileInfo && msg.fileInfo.fileSize) ||
      (msg.content && msg.content.size) ||
      (msg.file_info && msg.file_info.size) ||
      0;
    const fileSize = rawSize
      ? rawSize > 1024 * 1024
        ? `${(rawSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(rawSize / 1024).toFixed(1)} KB`
      : "Unknown size";
    const extMatch = fileName.match(/\.(\w+)$/);
    const fileExt = extMatch ? extMatch[1] : "";

    return {
      fileName,
      fileSize,
      fileExt,
      // iconColor,
      // iconBg,
      fileType: fileExt?.toUpperCase() || "FILE",
    };
  }
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

  return (
    <>
      <div className="flex flex-col overflow-hidden bg-transparent mt-3">
        <div className="text-center">
          <div
            className="mx-auto w-full"
            style={{
              maxWidth: "343px",
              minHeight: "185px",
              borderRadius: "24px",
              background: "rgba(128,128,128,0.3)", // #808080 30%
              border: "1px solid rgba(128,128,128,0.3)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Avatar className="w-24 h-24 mb-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                  priority
                />
              ) : (
                <AvatarFallback className="bg-purple-400 text-white text-5xl font-bold">
                  {user.displayName?.slice(0, 1)}
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-lg font-semibold mt-1">{user.displayName}</p>
            <p className="text-sm text-[#6B7271] font-normal">
              {isActuallyOnline ? "Online" : getDetailedStatus(lastSeen)}
            </p>
          </div>

          <div
            className="mx-auto flex justify-between items-center"
            style={{
              maxWidth: "343px",
              width: "100%",
              paddingTop: "16px",
              paddingBottom: "16px",
              gap: "2px",
            }}
          >
            {/* Call */}
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: "109px",
                height: "70px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
              onClick={() => handleStartCall("voice")}
            >
              <CallIcon />
              <p className="text-xs font-medium text-[#026AE0]">Call</p>
            </div>

            {/* Video */}
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: "109px",
                height: "70px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
              onClick={() => handleStartCall("video")}
            >
              <VideoIcon />
              <p className="text-xs font-medium text-[#026AE0]">Video</p>
            </div>

            {/* Mute */}
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: "109px",
                height: "70px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              <MuteButton onMuteUntil={handleMuteUntil} roomId={roomId} />
            </div>
          </div>

          {/* User info section */}
          <div className="w-full max-w-[343px] mx-auto rounded-[24px] border border-[rgba(131,131,131,0.3)] bg-[rgba(255,255,255,0.3)] pt-4 pb-4 pl-[12px] pr-[12px] text-start flex flex-col mb-2 gap-0.5 shadow">
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Phone number
              </p>
              <p className="text-[#155dfc] text-[12px] break-all">
                +84 123 456 78 90
              </p>
            </div>

            <hr className="border-[#FFFFFF4D]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black dark:text-white">
                  Username
                </p>
                <p className="text-[#155dfc] text-[12px] break-all">
                  @{user.userId?.split(":")[0].replace(/^@/, "")}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M3.125 4.5625C3.125 4.045 3.545 3.625 4.0625 3.625H7.8125C8.33 3.625 8.75 4.045 8.75 4.5625V8.3125C8.75 8.83 8.33 9.25 7.8125 9.25H4.0625C3.81386 9.25 3.5754 9.15123 3.39959 8.97541C3.22377 8.7996 3.125 8.56114 3.125 8.3125V4.5625ZM3.125 12.6875C3.125 12.17 3.545 11.75 4.0625 11.75H7.8125C8.33 11.75 8.75 12.17 8.75 12.6875V16.4375C8.75 16.955 8.33 17.375 7.8125 17.375H4.0625C3.81386 17.375 3.5754 17.2762 3.39959 17.1004C3.22377 16.9246 3.125 16.6861 3.125 16.4375V12.6875ZM11.25 4.5625C11.25 4.045 11.67 3.625 12.1875 3.625H15.9375C16.455 3.625 16.875 4.045 16.875 4.5625V8.3125C16.875 8.83 16.455 9.25 15.9375 9.25H12.1875C11.9389 9.25 11.7004 9.15123 11.5246 8.97541C11.3488 8.7996 11.25 8.56114 11.25 8.3125V4.5625Z"
                  stroke="#026AE0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.625 6.125H6.25V6.75H5.625V6.125ZM5.625 14.25H6.25V14.875H5.625V14.25ZM13.75 6.125H14.375V6.75H13.75V6.125ZM11.25 11.75H11.875V12.375H11.25V11.75ZM11.25 16.75H11.875V17.375H11.25V16.75ZM16.25 11.75H16.875V12.375H16.25V11.75ZM16.25 16.75H16.875V17.375H16.25V16.75ZM13.75 14.25H14.375V14.875H13.75V14.25Z"
                  stroke="#026AE0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <hr className="border-[#FFFFFF4D]" />

            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Bio
              </p>
              <p className="text-sm text-[14px] text-#6B7271 dark:text-gray-300">
                Lorem ipsum dolor sit amet 🔥🍀🥇
              </p>
            </div>
          </div>

          {(mediaMessages.length > 0 ||
            linkMessages.length > 0 ||
            fileMessages.length > 0 ||
            voiceMessages.length > 0 ||
            groupMessages.length > 0) && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="bg-transparent mt-2 rounded-none">
                {/* Custom horizontal scrollable tab buttons */}
                <div
                  className="w-full max-w-[343px] mx-auto flex overflow-x-auto scrollbar-hide"
                  style={{
                    gap: "6px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    paddingLeft: "0px",
                    paddingRight: "16px",
                  }}
                >
                  {/* Media */}
                  {mediaMessages.length > 0 && (
                    <button
                      className={`flex flex-col items-center justify-center min-w-[66px] h-[44px] rounded-[16px] border px-4 py-3 cursor-pointer transition-all ${
                        activeTab === "media"
                          ? "bg-[#155dfc] text-white border-[#155dfc]"
                          : "border-[rgba(128,128,128,0.3)] bg-[#8080804D] text-white"
                      }`}
                      style={{
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                      }}
                      onClick={() => setActiveTab("media")}
                    >
                      <span className="text-[14px] font-medium">Media</span>
                    </button>
                  )}
                  {/* Files */}
                  {fileMessages.length > 0 && (
                    <button
                      className={`flex flex-col items-center justify-center min-w-[66px] h-[44px] rounded-[16px] border px-4 py-3 cursor-pointer transition-all ${
                        activeTab === "files"
                          ? "bg-[#155dfc] text-white border-[#155dfc]"
                          : "border-[rgba(128,128,128,0.3)] bg-[#8080804D] text-white"
                      }`}
                      style={{
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                      }}
                      onClick={() => setActiveTab("files")}
                    >
                      <span className="text-[15px] font-medium">Files</span>
                    </button>
                  )}
                  {/* Voice */}
                  <button
                    className={`flex flex-col items-center justify-center min-w-[66px] h-[44px] rounded-[16px] border px-4 py-3 cursor-pointer transition-all ${
                      activeTab === "voice"
                        ? "bg-[#155dfc] text-white border-[#155dfc]"
                        : "border-[rgba(128,128,128,0.3)] bg-[#8080804D] text-white"
                    }`}
                    style={{
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      paddingLeft: "16px",
                      paddingRight: "16px",
                    }}
                    onClick={() => setActiveTab("voice")}
                  >
                    <span className="text-[14px] font-medium">Voice</span>
                  </button>
                  {/* Links */}
                  {linkMessages.length > 0 && (
                    <button
                      className={`flex flex-col items-center justify-center min-w-[66px] h-[44px] rounded-[16px] border px-4 py-3 cursor-pointer transition-all ${
                        activeTab === "link"
                          ? "bg-[#155dfc] text-white border-[#155dfc]"
                          : "border-[rgba(128,128,128,0.3)] bg-[#8080804D] text-white"
                      }`}
                      style={{
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                      }}
                      onClick={() => setActiveTab("link")}
                    >
                      <span className="text-[14px] font-medium">Links</span>
                    </button>
                  )}
                  {/* Groups */}
                  <button
                    className={`flex flex-col items-center justify-center min-w-[66px] h-[44px] rounded-[16px] border px-4 py-3 cursor-pointer transition-all ${
                      activeTab === "groups"
                        ? "bg-[#155dfc] text-white border-[#155dfc]"
                        : "border-[rgba(128,128,128,0.3)] bg-[#8080804D] text-white"
                    }`}
                    style={{
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      paddingLeft: "16px",
                      paddingRight: "16px",
                    }}
                    onClick={() => setActiveTab("groups")}
                  >
                    <span className="text-[14px] font-medium">Groups</span>
                  </button>
                </div>

                {/* Tổng số items dưới tab, căn giữa */}
                {activeTab === "media" && (
                  <div className="w-full max-w-[343px] mx-auto text-center mt-2 mb-1 text-[12px] text-[#6B7271] font-medium">
                    {(() => {
                      const photoCount = mediaMessages.filter(
                        (msg) => msg.type === "image" && msg.imageUrl
                      ).length;
                      const videoCount = mediaMessages.filter(
                        (msg) => msg.type === "video" && msg.videoUrl
                      ).length;
                      const result = [];
                      if (photoCount > 0)
                        result.push(
                          `${photoCount} photo${photoCount > 1 ? "s" : ""}`
                        );
                      if (videoCount > 0)
                        result.push(
                          `${videoCount} video${videoCount > 1 ? "s" : ""}`
                        );
                      return result.length > 0 ? result.join(", ") : "0 media";
                    })()}
                  </div>
                )}

                {activeTab === "files" && (
                  <div className="w-full max-w-[343px] mx-auto text-center mt-2 mb-1 text-[12px] text-[#6B7271] font-medium">
                    {fileMessages.length} file
                    {fileMessages.length > 1 ? "s" : ""}
                  </div>
                )}
                {activeTab === "files" && (
                  <TabsContent value="files">
                    <div className="max-h-[420px] overflow-y-auto overscroll-contain px-0">
                      <div className="space-y-0">
                        {[...fileMessages]
                          .sort(
                            (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
                          )
                          .map((msg, idx) => {
                            const info = getFileInfo(msg);
                            const ext = info.fileExt?.toUpperCase();
                            const isUnknownExt =
                              !ext ||
                              ![
                                "DOC",
                                "DOCX",
                                "TXT",
                                "SVG",
                                "MP4",
                                "PDF",
                              ].includes(ext);
                            return (
                              <a
                                key={msg.eventId || idx}
                                href={msg.fileUrl ?? ""}
                                download={info.fileName}
                                className="flex items-center px-4 py-3 border-b border-[#e5e5e5] bg-transparent hover:bg-gray-50 transition cursor-pointer"
                                title="Download file"
                              >
                                {/* Icon file type */}
                                <div
                                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
                                  style={{
                                    background: isUnknownExt
                                      ? "#E5E7EB"
                                      : undefined,
                                  }}
                                >
                                  {isUnknownExt ? (
                                    <span
                                      className="text-base font-bold text-[#6B7271]"
                                      style={{
                                        borderRadius: "6px",
                                        padding: "4px 10px",
                                        minWidth: "44px",
                                        display: "inline-block",
                                        textAlign: "center",
                                        fontSize: "18px",
                                        background: "#E5E7EB",
                                      }}
                                    >
                                      {info.fileName.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-xs font-bold text-white"
                                      style={{
                                        borderRadius: "6px",
                                        padding: "4px 10px",
                                        minWidth: "44px",
                                        display: "inline-block",
                                        textAlign: "center",
                                        fontSize: "15px",
                                      }}
                                    >
                                      {(ext === "DOC" || ext === "DOCX") && (
                                        <DocIcon />
                                      )}
                                      {ext === "TXT" && <TxtIcon />}
                                      {ext === "SVG" && <SvgIcon />}
                                      {ext === "MP4" && <Mp4Icon />}
                                      {ext === "PDF" && <PdfIcon />}
                                    </span>
                                  )}
                                </div>
                                {/* Nội dung file */}
                                <div
                                  className="flex flex-col justify-center min-w-0"
                                  style={{
                                    minWidth: 0,
                                    marginLeft: "12px",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <span
                                    className="font-medium text-[16px] text-black dark:text-white truncate"
                                    style={{
                                      lineHeight: "22px",
                                      marginBottom: "2px",
                                      textAlign: "left",
                                      maxWidth: "100%",
                                      display: "block",
                                    }}
                                  >
                                    {info.fileName}
                                  </span>
                                  <span
                                    className="text-xs text-[#6B7271]"
                                    style={{
                                      lineHeight: "18px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {info.fileSize}
                                  </span>
                                </div>
                                {/* Ngày tháng */}
                                <div className="ml-auto text-xs text-[#6B7271] whitespace-nowrap pl-4 flex flex-col justify-center items-end h-full">
                                  {msg.timestamp
                                    ? new Date(
                                        msg.timestamp
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }) +
                                      " " +
                                      new Date(
                                        msg.timestamp
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : ""}
                                </div>
                              </a>
                            );
                          })}
                      </div>
                    </div>
                  </TabsContent>
                )}
                {activeTab === "voice" && (
                  <div className="w-full max-w-[343px] mx-auto text-center mt-2 mb-1 text-[12px] text-[#6B7271] font-medium">
                    {voiceMessages.length} voice message
                  </div>
                )}
                {activeTab === "link" && (
                  <div className="w-full max-w-[343px] mx-auto text-center mt-2 mb-1 text-[12px] text-[#6B7271] font-medium">
                    {linkMessages.length} links
                  </div>
                )}
                {activeTab === "groups" && (
                  <div className="w-full max-w-[343px] mx-auto text-center mt-2 mb-1 text-[12px] text-[#6B7271] font-medium">
                    {groupMessages.length} mutual groups
                  </div>
                )}

                {/* Nội dung tab */}
                <div className="w-full max-w-auto mx-auto mt-2">
                  {activeTab === "media" && (
                    <TabsContent value="media">
                      <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                        <div className="grid grid-cols-3 gap-0.5 p-1">
                          {mediaMessages.map((msg, idx) => (
                            <div
                              key={msg.eventId || idx}
                              className="aspect-square"
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
                  {activeTab === "voice" && (
                    <TabsContent value="voice">
                      <div className="max-h-[420px] overflow-y-auto overscroll-contain pb-4 bg-transparent">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                          {voiceMessages.map((msg, idx) => (
                            <li
                              key={msg.eventId || idx}
                              className="flex items-center px-4 py-3 border-b border-[#e5e5e5] bg-transparent"
                            >
                              {/* Nút play icon */}
                              <button
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
                                style={{ background: "#0A2787" }}
                                onClick={() => {
                                  const audio = document.getElementById(
                                    `audio-${msg.eventId}`
                                  ) as HTMLAudioElement;
                                  if (audio) {
                                    if (audio.paused) {
                                      document
                                        .querySelectorAll("audio")
                                        .forEach((a) => {
                                          if (a.id !== `audio-${msg.eventId}`)
                                            a.pause();
                                        });
                                      audio.play();
                                    } else {
                                      audio.pause();
                                    }
                                  }
                                }}
                              >
                                <AudioIcon />
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
                                      timeDisplay.textContent = `${currentMin}:${currentSec
                                        .toString()
                                        .padStart(2, "0")}`;
                                    }
                                  }}
                                />
                              </button>
                              {/* Nội dung voice */}
                              <div
                                className="flex flex-col justify-center ml-3"
                                style={{ minWidth: "180px" }}
                              >
                                <span
                                  className="font-medium text-[16px] text-black dark:text-white truncate"
                                  style={{
                                    lineHeight: "22px",
                                    marginBottom: "2px",
                                    textAlign: "left",
                                  }}
                                >
                                  {msg.senderDisplayName ||
                                    msg.sender ||
                                    "Voice message"}
                                </span>
                                <span
                                  className="text-xs text-[#6B7271]"
                                  style={{
                                    lineHeight: "18px",
                                    textAlign: "left",
                                  }}
                                >
                                  <span id={`time-${msg.eventId}`}>
                                    {msg.audioDuration
                                      ? `${String(
                                          Math.floor(msg.audioDuration / 60)
                                        ).padStart(2, "0")}:${String(
                                          Math.floor(msg.audioDuration % 60)
                                        ).padStart(2, "0")}`
                                      : "00:00"}
                                  </span>
                                </span>
                              </div>
                              {/* Ngày tháng */}
                              <div className="ml-auto text-xs text-[#6B7271] whitespace-nowrap pl-4 flex flex-col justify-center items-end h-full">
                                {msg.timestamp
                                  ? new Date(msg.timestamp).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                    ) +
                                    " " +
                                    new Date(msg.timestamp).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : ""}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  )}
                  {/* {activeTab === "link" && (
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
                  )} */}
                  {activeTab === "link" && (
                    <TabsContent value="link">
                      <div className="max-h-[420px] overflow-y-auto overscroll-contain px-0">
                        <div className="space-y-0">
                          {linkMessages.map((msg, index) => {
                            if (!msg) return null;
                            const match = msg.text.match(
                              /(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i
                            );
                            const rawUrl = match?.[0];
                            const url = rawUrl?.startsWith("http")
                              ? rawUrl
                              : `https://${rawUrl}`;
                            // Lấy favicon tự động từ domain
                            const getFavicon = (url: string) => {
                              try {
                                const u = new URL(url);
                                return `https://www.google.com/s2/favicons?sz=64&domain=${u.hostname}`;
                              } catch {
                                return "";
                              }
                            };
                            const favicon = getFavicon(url);

                            // Lấy tên domain và chuyển thành tên thương hiệu
                            function getBrandName(url: string) {
                              try {
                                const u = new URL(url);
                                const domain = u.hostname.replace("www.", "");
                                const name = domain.split(".")[0];
                                return (
                                  name.charAt(0).toUpperCase() + name.slice(1)
                                );
                              } catch {
                                return url;
                              }
                            }
                            const brand = getBrandName(url);

                            // Mô tả: lấy dòng thứ 2 hoặc fallback
                            const desc =
                              msg.text.split("\n")[1] ||
                              "Lorem ipsum dolor sit amet consectetur.";
                            return url ? (
                              <div
                                key={msg.eventId || index}
                                className="flex items-center px-4 py-3 border-b border-[#e5e5e5] bg-transparent"
                              >
                                {/* Icon */}
                                <div
                                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden mr-3"
                                  style={{ background: "#F7F6F2" }}
                                >
                                  {favicon ? (
                                    <Image
                                      src={favicon}
                                      alt="icon"
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                                      <span className="text-lg font-bold text-white">
                                        {brand.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Nội dung link */}
                                <div className="flex flex-col justify-center min-w-0">
                                  <span
                                    className="font-medium text-[16px] text-black dark:text-white truncate"
                                    style={{
                                      lineHeight: "22px",
                                      marginBottom: "2px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {brand}
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[13px] text-[#155dfc] break-all"
                                    style={{
                                      textAlign: "left",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    {url}
                                  </a>
                                  <span
                                    className="text-xs text-[#6B7271] truncate"
                                    style={{ textAlign: "left" }}
                                  >
                                    {desc}
                                  </span>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                  {activeTab === "groups" && (
                    <TabsContent value="groups">
                      <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                        <div className="space-y-4 p-2">
                          {groupMessages.map((msg, idx) => (
                            <div
                              key={msg.eventId || idx}
                              className="bg-gray-100 dark:bg-[#2c2c2e] p-4 rounded-lg"
                            >
                              <p className="text-sm font-medium dark:text-white">
                                {msg.senderDisplayName || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(msg.timestamp || 0).toLocaleString()}
                              </p>
                              <p className="mt-2">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </div>
              </div>
            </Tabs>
          )}
        </div>
      </div>

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
