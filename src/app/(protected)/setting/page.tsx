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
import { MatrixAuthService } from "@/services/matrixAuthService";
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
  const { user, setUser } = useUserStore();
  const hasFetched = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const authService = new MatrixAuthService();
        const userId = authService.client?.getUserId?.();
        if (!userId) return;

        const profile = await authService.client.getProfileInfo(userId);

        console.log("🔄 Fetching profile from server...");
        console.log("📦 Local displayName:", user?.displayName);
        console.log("🆔 userId:", userId);
        console.log("🪪 Server profile:", profile);

        if (profile.displayname) {
          setUser({ displayName: profile.displayname });
        }
      } catch (error) {
        console.error("Lỗi khi fetch profile:", error);
      }
    };

    if (isHydrated) fetchProfile();
  }, [setUser, user?.displayName, isHydrated]);


  if (!isHydrated) return null; // 👈 tránh render sai trước khi Zustand khởi tạo

  // Render page...
  const displayName = user ? user.displayName : "Your Name"
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File được chọn:", file.name);
      // Nếu cần upload: thực hiện fetch/axios POST lên server tại đây
    }
  };

  return (
    <>
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 pt-4">
          <QrCode className="h-6 w-6 text-blue-500" />
          <div className="absolute left-1/2 transform -translate-x-1/2 top-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
          </div>
          <Button
            className="text-blue-500 hover:bg-zinc-300 bg-white dark:bg-transparent border dark:hover:text-blue-700"
            size="sm"
          >
            Edit
          </Button>
        </div>
        <div className="mt-16 text-center px-4 pb-4">
          <h1 className="text-2xl font-semibold">{user?.displayName ?? "Your Name"}</h1>
          <p className="text-sm text-gray-400">+84 12345689</p>
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
