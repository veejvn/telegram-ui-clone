"use client";
import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Camera,
  AtSign,
  User,
  Bookmark,
  PhoneCall,
  QrCode,
  Folder,
  Bell,
  Lock,
  Database,
  Palette,
  Smartphone,
  ChevronRight,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { getInitials } from "@/utils/getInitials";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { getBackgroundColorClass } from "@/utils/getBackgroundColor ";

interface SettingItem {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
  path?: string;
}

const group1: SettingItem[] = [
  {
    title: "Saved Messages",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#1877F2]">
        <Bookmark className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/saved-message",
  },
  {
    title: "Recent Calls",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#34C759]">
        <PhoneCall className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/recent-call",
  },
  {
    title: "Devices",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#FF9500]">
        <Smartphone className="h-5 w-5 text-white" />
      </span>
    ),
    extra: <span className="text-sm text-gray-400">Scan QR</span>,
    path: "/setting/device",
  },
  {
    title: "Chat Folders",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#30B6F6]">
        <Folder className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/chat-folder",
  },
];

const group2: SettingItem[] = [
  {
    title: "Notifications and Sounds",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#FF3B30]">
        <Bell className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/notification-and-sound",
  },
  {
    title: "Privacy and Security",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#8E8E93]">
        <Lock className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/privacy-and-security",
  },
  {
    title: "Data and Storage",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#34C759]">
        <Database className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/data-and-storage",
  },
  {
    title: "Appearance",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#30B6F6]">
        <Palette className="h-5 w-5 text-white" />
      </span>
    ),
    path: "/setting/appearance",
  },
  {
    title: "Language",
    icon: (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-[10px] bg-[#007AFF]">
        <Globe className="h-5 w-5 text-white" />
      </span>
    ),
    extra: <span className="text-sm text-gray-400">English</span>,
    path: "/setting/language",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useMatrixClient();
  const userId = useAuthStore.getState().userId;
  const { user, setUser } = useUserStore.getState();
  const displayName = user ? user.displayName : "Tên";
  const phone = user?.phone || "Sđt";
  const homeserver = user?.homeserver?.replace("https://", "") || "";
  const [_, setRefresh] = useState(0);

  // Đưa fetchAvatar ra ngoài useEffect
  const fetchAvatar = async () => {
    if (!client || !userId) return;
    try {
      const profile = await client.getProfileInfo(userId);
      if (profile && profile.avatar_url) {
        const httpUrl = client.mxcUrlToHttp(profile.avatar_url, 96, 96, "crop") ?? "";
        const isValid = /^https?:\/\//.test(httpUrl) && !httpUrl.includes("M_NOT_FOUND");
        if (isValid) {
          try {
            const res = await fetch(httpUrl, { method: "HEAD" });
            if (res.ok) {
              const apiUrl = `/api/matrix-image?url=${encodeURIComponent(httpUrl)}`;
              setUser({ avatarUrl: apiUrl });
              setRefresh((prev) => prev + 1);
              return;
            }
          } catch { }
        }
      }
      setUser({ avatarUrl: "" });
    } catch {
      setUser({ avatarUrl: "" });
    }
  };

  useEffect(() => {
    fetchAvatar();
    // eslint-disable-next-line
  }, [client, userId, setUser]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    try {
      if (!userId) throw new Error("Không tìm thấy userId");
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const uploadRes = await client.uploadContent(uint8Array, {
        name: file.name,
        type: file.type,
        onlyContentUri: true,
      } as any);

      let avatarUrl: string;
      if (typeof uploadRes === "string") {
        avatarUrl = uploadRes;
      } else if (typeof uploadRes === "object" && "content_uri" in uploadRes) {
        avatarUrl = uploadRes.content_uri;
      } else {
        throw new Error("Upload result unknown");
      }

      await client.setAvatarUrl(avatarUrl);
      await fetchAvatar();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleClickEdit = () => {
    router.push("/setting/profile/edit");
  };

  const avatarBackgroundColor = getBackgroundColorClass(userId);

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#101014] pb-8">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <QrCode className="h-6 w-6 text-blue-500" />
          <Button
            variant="ghost"
            className="text-blue-500 text-base font-medium px-2 py-1 h-auto shadow-none border-none"
            onClick={handleClickEdit}
          >
            Edit
          </Button>
        </div>
        <div className="flex flex-col items-center mt-2 mb-2">
          <Avatar className={`h-20 w-20 text-3xl ${avatarBackgroundColor}`}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover"
                width={80}
                height={80}
                loading="lazy"
              />
            ) : (
              <AvatarFallback className="text-3xl">
                {getInitials(displayName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="mt-3 text-lg font-semibold">{displayName}</div>
          <div className="text-sm text-blue-500">
            Homeserver: {homeserver}
          </div>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] border dark:border-[#232323] divide-y shadow-sm mb-4">
        <div
          className="flex items-center px-4 py-2 cursor-pointer"
          onClick={handleFileSelect}
        >
          <Camera className="h-4 w-4 text-[#1877F2] mr-2" />
          <span className="text-[17px] text-[#1877F2]">Set Profile Photo</span>
        </div>
        <div
          className="flex items-center px-4 py-2 cursor-pointer"
          onClick={() => router.push("/setting/set-username")}
        >
          <AtSign className="h-4 w-4 text-[#1877F2] mr-2" />
          <span className="text-[17px] text-[#1877F2]">Set Username</span>
        </div>
      </div>

      {/* My Profile */}
      <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] border dark:border-[#232323] flex items-center justify-between px-4 py-3 mb-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#FF2D55]">
            <User className="h-5 w-5 text-white" />
          </span>
          <span className="font-medium text-[15px]">My Profile</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Group 1: Saved, Recent, Devices, Chat Folders */}
      <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] border dark:border-[#232323] shadow-sm mb-4 overflow-hidden">
        {group1.map((item, idx) => (
          <Link
            key={item.title}
            className={
              "flex items-center justify-between px-4 py-3 " +
              (idx !== group1.length - 1 ? "border-b dark:border-[#232323] " : "") +
              "text-black dark:text-white"
            }
            href={item.path || "#"}
          >
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-[8px] bg-[color]">
                {/* Đổi bg-[color] cho từng icon như bạn đã làm */}
                {item.icon}
              </span>
              <span className="text-[15px]">{item.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.extra && (
                <span className="text-xs text-gray-400">{item.extra}</span>
              )}
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Group 2: Notifications, Privacy, Data, Appearance, Language */}
      <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] border dark:border-[#232323] shadow-sm overflow-hidden">
        {group2.map((item, idx) => (
          <Link
            key={item.title}
            className={
              "flex items-center justify-between px-4 py-3 " +
              (idx !== group2.length - 1 ? "border-b dark:border-[#232323] " : "") +
              "text-black dark:text-white"
            }
            href={item.path || "#"}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.extra}
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
      {/* Thêm khoảng trống tránh bị che bởi thanh tab bar */}
      <div className="h-20" />
    </div>
  );
}
