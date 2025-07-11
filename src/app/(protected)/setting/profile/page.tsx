"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/useUserStore";
import { getInitials } from "@/utils/getInitials";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import React, { useEffect } from "react";
import { getBackgroundColorClass } from "@/utils/getBackgroundColor ";
import { extractUsernameFromMatrixId } from "@/utils/matrixHelpers";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";
import { useTheme } from "next-themes";

export default function MyProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore.getState();
  let displayName = user ? user.displayName : "Your Name";
  if (displayName.startsWith("@")) {
    displayName = extractUsernameFromMatrixId(displayName.replace(/=40/g, "@"));
  }
  const phone = user?.phone || true;

  // Logic lấy avatar từ Matrix giống trang Setting
  const client = useMatrixClient();
  const userId = useAuthStore.getState().userId;
  const decodedUserId = userId?.replace(/=40/g, "@");

  useEffect(() => {
    if (!client || !userId) return;
    if (user?.avatarUrl) return;

    const fetchAvatar = async () => {
      try {
        const profile = await client.getProfileInfo(userId);
        if (profile && profile.avatar_url) {
          const httpUrl = client.mxcUrlToHttp(profile.avatar_url, 96, 96, "crop") ?? "";
          setUser({ avatarUrl: httpUrl });
        } else {
          setUser({ avatarUrl: "" });
        }
      } catch {
        setUser({ avatarUrl: "" });
      }
    };
    fetchAvatar();

    // Lắng nghe realtime nếu cần
    const userObj = client.getUser?.(userId) as any;
    if (!userObj) return;
    const handler = () => fetchAvatar();
    userObj.on?.("User.avatarUrl", handler);
    return () => userObj.off?.("User.avatarUrl", handler);
  }, [client, userId]);

  const avatarBackgroundColor = getBackgroundColorClass(userId);

  // Status bar màu theo theme
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div className="dark:bg-black dark:text-white min-h-screen px-4 pt-6 pb-10">
      <Head>
        <meta name="theme-color" content={isDark ? "#101014" : "#fff"} />
      </Head>
      {/* Header né status bar */}
      <div className="flex justify-between items-center mb-6" style={headerStyle}>
        <button
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400 text-sm font-medium pl-1"
        >
          Back
        </button>
        <button
          onClick={() => router.push("/setting/profile/edit")}
          className="text-blue-600 dark:text-blue-400 text-sm font-medium pl-1"
        >
          Edit
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Avatar
          className={`w-20 h-20 text-white text-2xl ${avatarBackgroundColor}`}
        >
          {user?.avatarUrl ? (
            <img
              src={user?.avatarUrl}
              alt="avatar"
              className="h-20 w-20 rounded-full object-cover"
              width={80}
              height={80}
              loading="lazy"
            />
          ) : (
            <AvatarFallback className={`text-xl`}>
              {getInitials(displayName)}
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-xl font-semibold">{displayName}</h2>
        <span className="text-sm text-blue-500">{decodedUserId}</span>
        <span className="text-gray-500 text-sm">{user?.status}</span>
      </div>

      {/* Mobile Info */}
      {phone && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-6">
          <div className="text-xs dark:text-white mb-1">mobile</div>
          <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">{phone}</div>
        </div>
      )}

      {/* Posts Section */}
      <div>
        <h3 className="text-sm font-semibold text-black dark:text-white mb-2">Posts</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <img src="/chat/images/no-post-yet.png" alt="No posts" className="mb-4" />
          <p className="text-sm text-gray-500 mb-2">No posts yet...</p>
          <p className="text-xs text-gray-400 mb-4">
            Publish photos and videos to display on your profile page.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add a Post
          </Button>
        </div>
      </div>
    </div>
  );
}
