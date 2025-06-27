"use client";
import React, { useState, useRef, useEffect } from "react";
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

const settings: SettingItem[] = [
  {
    title: "My Profile",
    icon: <User className="h-6 w-6 text-red-500" />,
    path: "/setting/profile",
  },
  {
    title: "Saved Messages",
    icon: <Bookmark className="h-6 w-6 text-blue-500" />,
    path: "/setting/saved-message",
  },
  {
    title: "Recent Calls",
    icon: <PhoneCall className="h-6 w-6 text-green-500" />,
    path: "/setting/recent-call",
  },
  {
    title: "Devices",
    icon: <Smartphone className="h-6 w-6 text-orange-500" />,
    extra: <span className="text-sm text-gray-400">Scan QR</span>,
    path: "/setting/device",
  },
  {
    title: "Chat Folders",
    icon: <Folder className="h-6 w-6 text-cyan-500" />,
    path: "/setting/chat-folder",
  },
  {
    title: "Notifications and Sounds",
    icon: <Bell className="h-6 w-6 text-red-500" />,
    path: "/setting/notification-and-sound",
  },
  {
    title: "Privacy and Security",
    icon: <Lock className="h-6 w-6 text-gray-400" />,
    path: "/setting/privacy-and-security",
  },
  {
    title: "Data and Storage",
    icon: <Database className="h-6 w-6 text-green-600" />,
    path: "/setting/data-and-storage",
  },
  {
    title: "Appearance",
    icon: <Palette className="h-6 w-6 text-blue-700" />,
    path: "/setting/appearance",
  },
  {
    title: "Language",
    icon: <Globe className="h-6 w-6 text-violet-600" />,
    extra: <span className="text-sm text-gray-400">English</span>,
    path: "/setting/language",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useMatrixClient();
  const userId = useAuthStore.getState().userId;
  const { user } = useUserStore.getState();
  const displayName = user ? user.displayName : "Your Name";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 1. Lấy avatar_url (MXC) và chuyển sang HTTP URL, ưu tiên dùng proxy nếu cần
  const fetchAvatar = async () => {
    if (!client || !userId) return;
    try {
      const profile = await client.getProfileInfo(userId);
      if (profile && profile.avatar_url) {
        const httpUrl = client.mxcUrlToHttp(profile.avatar_url, 96, 96, "crop") ?? "";
        console.log("avatar_url:", profile.avatar_url);
        console.log("httpUrl:", httpUrl);

        // Kiểm tra link HTTP thực tế
        const isValid = /^https?:\/\//.test(httpUrl) && !httpUrl.includes("M_NOT_FOUND");
        if (isValid) {
          // Test link HTTP thực tế
          try {
            const res = await fetch(httpUrl, { method: "HEAD" });
            if (res.ok) {
              setAvatarUrl(`/api/matrix-image?url=${encodeURIComponent(httpUrl)}`);
              return;
            }
          } catch (e) {
            // Nếu fetch lỗi, sẽ fallback
          }
        }
        setAvatarUrl("");
      } else {
        setAvatarUrl("");
      }
    } catch (error) {
      setAvatarUrl("");
      console.error("Error loading avatar:", error);
    }
  };

  // 6. Lắng nghe sự kiện thay đổi avatar để cập nhật realtime
  useEffect(() => {
    fetchAvatar();
    if (!client || !userId) return;

    const userObj = client.getUser?.(userId) as any;
    if (!userObj) return;

    const handler = () => fetchAvatar();
    userObj.on?.("User.avatarUrl", handler);

    return () => {
      userObj.off?.("User.avatarUrl", handler);
    };
    // eslint-disable-next-line
  }, [client, userId]);
  // eslint-disable-next-line

  // 5. Cho phép upload/thay đổi avatar
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client || !userId) return;
    try {
      // Upload lên Matrix media repo
      const uploadRes = await client.uploadContent(file, { type: file.type });
      // Đặt avatar mới
      await client.setProfileInfo("avatar_url", { avatar_url: uploadRes.content_uri });
      // Cập nhật lại avatar
      fetchAvatar();
    } catch (error) {
      console.error("Upload avatar failed:", error);
    }
  };

  const avatarBackgroundColor = getBackgroundColorClass(userId)

  return (
    <>
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 pt-4">
          <QrCode className="h-6 w-6 text-blue-500" />
          <div className="absolute left-1/2 transform -translate-x-1/2 top-4">
            <Avatar className={`h-20 w-20 ${avatarBackgroundColor}`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-20 w-20 rounded-full object-cover"
                  width={80}
                  height={80}
                  loading="lazy"
                />
              ) : (
                <AvatarFallback className="text-xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <Button
            className="text-blue-500 hover:bg-zinc-300 bg-white dark:bg-transparent border dark:hover:text-blue-700"
            size="sm"
            onClick={handleFileSelect}
          >
            Edit
          </Button>
        </div>
        <div className="mt-16 text-center px-4 pb-4">
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-sm text-blue-500">
            Homeserver: {user?.homeserver?.replace("https://", "")}
          </p>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="mx-4 rounded-2xl border-2 divide-y-2">
        {/* Set Profile Photo */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={handleFileSelect}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-base">Set Profile Photo</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </div>

        {/* Set Username */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => router.push("/setting/set-username")}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
              <AtSign className="h-5 w-5" />
            </div>
            <span className="text-base">Set Username</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Settings List */}
      <div className="p-4 space-y-2">
        {settings.map((item) => (
          <Link
            key={item.title}
            className="flex items-center justify-between border-2 rounded-2xl px-4 py-3"
            href={item.path || "#"}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.extra}
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </div>
          </Link>
        ))}
        <div className="h-14"></div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </>
  );
}
