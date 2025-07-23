"use client";

import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function PrivateInfoHeader({ user }: { user: sdk.User }) {
  const router = useRouter();
  const client = useMatrixClient();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const isDefaultAvatar = !avatarUrl;
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!client || !user.avatarUrl) return;
      try {
        const httpUrl =
          client.mxcUrlToHttp(user.avatarUrl, 120, 120, "scale", true) ?? "";
        setAvatarUrl(httpUrl);
      } catch (error) {
        setAvatarUrl("");
        console.error("Error loading avatar:", error);
      }
    };

    fetchAvatar();
  }, [client]);

  return (
    <div className="absolute top-0 left-0 w-full z-20 bg-transparent">
      <div className="flex justify-between items-center px-2 py-2">
        <button
          onClick={() => router.back()}
          className={
            isDefaultAvatar
              ? "flex items-center text-blue-600 text-lg font-medium bg-transparent px-2 py-1 shadow-none"
              : "flex items-center text-white text-lg font-medium bg-black/30 rounded-full px-3 py-1 hover:bg-black/50 transition"
          }
        >
          <ChevronLeft />
          <span className="ml-1">Back</span>
        </button>
        <button
          className={
            isDefaultAvatar
              ? "text-blue-600 text-lg font-medium bg-transparent px-2 py-1 shadow-none"
              : "text-white text-lg font-medium bg-black/30 rounded-full px-3 py-1 hover:bg-black/50 transition"
          }
        >
          Edit
        </button>
      </div>
    </div>
  );
}
