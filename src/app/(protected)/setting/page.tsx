"use client";
import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProfileIcon from "@/icons/telegram/profile.svg";
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
  Star,
  Store,
  Gift,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  BatteryCharging,
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
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#0479fd] mr-2 overflow-hidden">
        <img
          src="/images/telegram/saved-message.jpg"
          alt="Saved Messages"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/saved-message",
  },
  {
    title: "Recent Calls",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#38c656] mr-2 overflow-hidden">
        <img
          src="/images/telegram/recent-call.png"
          alt="Recent Calls"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/recent-call",
  },
  {
    title: "Devices",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#fd9500] mr-2 overflow-hidden">
        <img
          src="/images/telegram/device.jpg"
          alt="Devices"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    extra: "Scan QR",
    path: "/setting/device",
  },
  {
    title: "Chat Folders",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#2dabdb] mr-2 overflow-hidden">
        <img
          src="/images/telegram/chat-folder.jpg"
          alt="Chat Folders"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/chat-folder",
  },
];

const group2: SettingItem[] = [
  {
    title: "Notifications and Sounds",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#fd3a38] mr-2 overflow-hidden">
        <img
          src="/images/telegram/notifications-and-sounds.jpg"
          alt="Notifications and Sounds"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/notification-and-sounds",
  },
  {
    title: "Privacy and Security",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#8f8e94] mr-2 overflow-hidden">
        <img
          src="/images/telegram/privacy-and-security.png"
          alt="Privacy and Security"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/privacy-and-security",
  },
  {
    title: "Data and Storage",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] mr-2 overflow-hidden bg-[#34C759] p-0">
        <img
          src="/images/telegram/data-and-storage.png"
          alt="Data and Storage"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/data-and-storage",
  },
  {
    title: "Appearance",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] mr-2 overflow-hidden bg-[#30B6F6] p-0">
        <img
          src="/images/telegram/appearance.png"
          alt="Appearance"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/appearance",
  },
  {
    title: "Power Saving",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#FF9500] mr-2 overflow-hidden p-0">
        <img
          src="/images/telegram/power-saving.png"
          alt="Power Saving"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    extra: "Off",
    path: "/setting/power-saving",
  },
  {
    title: "Language",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#A259E6] mr-2 overflow-hidden">
        <img
          src="/images/telegram/language.png"
          alt="Language"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    extra: "English",
    path: "/setting/language",
  },
];

const group3: SettingItem[] = [
  {
    title: "Telegram Premium",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#ad6ef0] mr-2 overflow-hidden">
        <img
          src="/images/telegram/premium.png"
          alt="Telegram Premium"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/premium",
  },
  {
    title: "My Stars",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#f99011] mr-2 overflow-hidden">
        <img
          src="/images/telegram/my-stars.jpg"
          alt="My Stars"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/my-stars",
  },
  {
    title: "Telegram Business",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#e06b95] mr-2 overflow-hidden">
        <img
          src="/images/telegram/business.png"
          alt="Telegram Business"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/business",
  },
  {
    title: "Send a Gift",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#01ace0] mr-2 overflow-hidden">
        <img
          src="/images/telegram/send-gift.jpg"
          alt="Send a Gift"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/send-gift",
  },
];

const group4: SettingItem[] = [
  {
    title: "Ask a Question",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#ff9600] mr-2 overflow-hidden">
        <img
          src="/images/telegram/ask-question.png"
          alt="Ask a Question"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/ask-question",
  },
  {
    title: "Telegram FAQ",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#2dabdb] mr-2 overflow-hidden">
        <img
          src="/images/telegram/faq.png"
          alt="Telegram FAQ"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/faq",
  },
  {
    title: "Telegram Features",
    icon: (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#fdcb14] mr-2 overflow-hidden">
        <img
          src="/images/telegram/features.png"
          alt="Telegram Features"
          className="w-5 h-5 object-cover rounded-[6px]"
          draggable={false}
        />
      </span>
    ),
    path: "/setting/features",
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

  const sections = [
    {
      key: "profile",
      render: () => (
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
            <Avatar className={`h-28 w-28 text-4xl ${avatarBackgroundColor}`}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="h-28 w-28 rounded-full object-cover"
                  width={112}
                  height={112}
                  loading="lazy"
                />
              ) : (
                <AvatarFallback className="text-4xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="mt-3 text-lg font-bold">{displayName}</div>
            <div className="text-sm text-blue-500 font-medium">
              Homeserver: {homeserver}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      render: () => (
        <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm mb-4 overflow-hidden">
          <div
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={handleFileSelect}
          >
            <span className="inline-flex items-center justify-center h-7 w-7 mr-2">
              <span className="relative">
                <Camera className="h-4 w-4 text-[#1877F2]" />
                <span className="absolute -bottom-1 -left-1 bg-white rounded-full border border-[#1877F2] w-2.5 h-2.5 flex items-center justify-center">
                  <span className="text-[#1877F2] text-[10px] leading-none font-normal">+</span>
                </span>
              </span>
            </span>
            <span className="text-[15px] font-normal flex-1 text-[#1877F2]">Set Profile Photo</span>
          </div>
          <div className="border-t border-[#f0f0f0] dark:border-[#232323]" />
          <div
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={() => router.push("/setting/set-username")}
          >
            <span className="inline-flex items-center justify-center h-7 w-7 mr-2">
              <span className="relative">
                <AtSign className="h-4 w-4 text-[#1877F2]" />
                <span className="absolute -bottom-1 -left-1 bg-white rounded-full border border-[#1877F2] w-2.5 h-2.5 flex items-center justify-center">
                  <span className="text-[#1877F2] text-[10px] leading-none font-normal">+</span>
                </span>
              </span>
            </span>
            <span className="text-[15px] font-normal flex-1 text-[#1877F2]">Set Username</span>
          </div>
        </div>
      ),
    },
    {
      title: "My Profile",
      icon: (
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#FF2D55] mr-2 overflow-hidden">
          <img
            src="/images/telegram/profile.png"
            alt="My Profile"
            className="w-5 h-5 object-cover rounded-[6px]"
            draggable={false}
          />
        </span>
      ),
      path: "/setting/profile",
    },

    {
      key: "group1",
      render: () => (
        <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm mb-4 overflow-hidden">
          {group1.map((item, idx) => (
            <Link
              key={item.title}
              className={
                "flex items-center justify-between px-4 py-2 " +
                (idx !== group1.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#232323] " : "") +
                "text-black dark:text-white"
              }
              href={item.path || "#"}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-[15px] font-normal">{item.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.extra && (
                  <span className="text-[15px] text-gray-400 font-normal">{item.extra}</span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ),
    },
    {
      key: "group2",
      render: () => (
        <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm overflow-hidden mb-4">
          {group2.map((item, idx) => (
            <Link
              key={item.title}
              className={
                "flex items-center justify-between px-4 py-3 " +
                (idx !== group2.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#232323] " : "") +
                "text-black dark:text-white"
              }
              href={item.path || "#"}
              style={
                // Thêm bo góc dưới cho mục cuối cùng (Language)
                idx === group2.length - 1
                  ? { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
                  : {}
              }
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-[15px] font-normal">{item.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.extra && (
                  <span className="text-[15px] text-gray-400 font-normal">{item.extra}</span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ),
    },
    {
      key: "group3",
      render: () => (
        <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm mb-4 overflow-hidden">
          {group3.map((item, idx) => (
            <Link
              key={item.title}
              className={
                "flex items-center justify-between px-4 py-2 " +
                (idx !== group3.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#232323] " : "") +
                "text-black dark:text-white"
              }
              href={item.path || "#"}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-[15px] font-normal">{item.title}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      ),
    },
    {
      key: "group4",
      render: () => (
        <div className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm mb-4 overflow-hidden">
          {group4.map((item, idx) => (
            <Link
              key={item.title}
              className={
                "flex items-center justify-between px-4 py-2 " +
                (idx !== group4.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#232323] " : "") +
                "text-black dark:text-white"
              }
              href={item.path || "#"}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-[15px] font-normal">{item.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.extra && (
                  <span className="text-[15px] text-gray-400 font-normal">{item.extra}</span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#101014] pb-8">
      {sections.map((section, index) => (
        <React.Fragment key={section.key || section.path || index}>
          {"render" in section && typeof section.render === "function" ? (
            section.render()
          ) : (
            <Link
              href={section.path || "#"}
              className="mx-4 rounded-2xl bg-white dark:bg-[#181818] shadow-sm flex items-center px-4 py-2 mb-4 transition hover:bg-gray-50 dark:hover:bg-[#232323]"
            >
              {section.icon}
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-normal">{section.title}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
            </Link>
          )}
        </React.Fragment>
      ))}
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
