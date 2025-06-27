"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/useUserStore";
import { getInitials } from "@/utils/getInitials";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import React, { useEffect, useState } from "react";
import { getBackgroundColorClass } from "@/utils/getBackgroundColor ";

export default function MyProfilePage() {
  const router = useRouter();
  const user = useUserStore.getState().user;
  const displayName = user ? user.displayName : "Your Name";

  // Thêm logic lấy avatar từ Matrix giống trang Setting
  const client = useMatrixClient();
  const userId = useAuthStore.getState().userId;
  const [avatarUrl, setAvatarUrl] = useState<string>(
    ""
  ); // fallback mặc định

  useEffect(() => {
    if (!client || !userId) return;

    const fetchAvatar = async () => {
      try {
        const profile = await client.getProfileInfo(userId);
        if (profile && profile.avatar_url) {
          const httpUrl =
            client.mxcUrlToHttp(profile.avatar_url, 96, 96, "crop") ?? "";
          const isValid =
            /^https?:\/\//.test(httpUrl) &&
            !httpUrl.includes("M_NOT_FOUND");
          if (isValid) {
            // Kiểm tra HEAD để chắc chắn link tồn tại
            try {
              const res = await fetch(httpUrl, { method: "HEAD" });
              if (res.ok) {
                setAvatarUrl(`/api/matrix-image?url=${encodeURIComponent(httpUrl)}`);
                return;
              }
            } catch {
              // Nếu fetch lỗi, sẽ fallback
            }
          }
        }
        setAvatarUrl("");
      } catch {
        setAvatarUrl("");
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

  const avatarBackgroundColor = getBackgroundColorClass(userId)

  return (
    <div className="bg-white text-black min-h-screen px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm font-medium pl-1"
        >
          Back
        </button>
        <button
          onClick={() => router.push("/setting/profile/edit")}
          className="text-blue-600 text-sm font-medium pl-1"
        >
          Edit
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Avatar className={`w-20 h-20 text-white text-2xl ${avatarBackgroundColor}`}>
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
            <AvatarFallback className={`text-xl`}>
              {getInitials(displayName)}
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-xl font-semibold">{displayName}</h2>
        <span className="text-gray-500 text-sm">{user?.status}</span>
      </div>

      {/* Posts Section */}
      <div>
        <h3 className="text-sm font-semibold text-black mb-2">Posts</h3>
        <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center py-12 text-center">
          <img
            src="/no-posts-placeholder.png"
            alt="No posts"
            className="w-24 h-24 mb-4"
          />
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
