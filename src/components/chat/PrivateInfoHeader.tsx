/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/ChatAvatar";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function PrivateInfoHeader({ user }: { user: sdk.User }) {
  const router = useRouter();
  const client = useMatrixClient();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);


  useEffect(() => {
    const fetchAvatar = async () => {
      if (!client || !user.avatarUrl) return;
      try {
        const httpUrl = client.mxcUrlToHttp(user.avatarUrl, 96, 96, "crop") ?? "";
  
        // Kiểm tra link HTTP thực tế
        const isValid =
          /^https?:\/\//.test(httpUrl) && !httpUrl.includes("M_NOT_FOUND");
        if (isValid) {
          // Test link HTTP thực tế
          try {
            const res = await fetch(httpUrl, { method: "HEAD" });
            if (res.ok) {
              const apiUrl = `/api/matrix-image?url=${encodeURIComponent(
                httpUrl
              )}`;
              setAvatarUrl(apiUrl);
              return;
            }
          } catch (e) {
            // Nếu fetch lỗi, sẽ fallback
          }
        }
        setAvatarUrl("");
      } catch (error) {
        setAvatarUrl("");
        console.error("Error loading avatar:", error);
      }
    };
    
    fetchAvatar();
  }, [client]);

  return (
    <>
      <div
        className="flex justify-between relativ dark:bg-[#1c1c1e]
        py-2 px-2"
      >
        <button
          onClick={() => router.back()}
          className="flex text-left text-blue-600
          cursor-pointer hover:opacity-70"
        >
          <ChevronLeft />
          <p>Back</p>
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center mt-3">
          <Avatar className="h-25 w-25">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-25 w-25 rounded-full object-cover"
                width={100}
                height={100}
                loading="lazy"
              />
            ) : (
              <AvatarFallback className="bg-purple-400 text-white text-5xl font-bold">
                {user.displayName?.slice(0, 1)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <p
          className="text-right flex text-blue-600
          cursor-pointer hover:opacity-70"
        >
          Edit
        </p>
      </div>
    </>
  );
}
