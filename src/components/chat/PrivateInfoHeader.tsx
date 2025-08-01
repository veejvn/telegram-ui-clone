/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
// import { Avatar, AvatarFallback } from "../ui/ChatAvatar";
import { ChevronLeft, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useParams } from "next/navigation";
export default function PrivateInfoHeader({ user }: { user: sdk.User }) {
  const router = useRouter();
  const client = useMatrixClient();
  const params = useParams();
  const roomId = params.id;
  // const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  // useEffect(() => {
  //   const fetchAvatar = async () => {
  //     if (!client || !user.avatarUrl) return;
  //     try {
  //       const httpUrl =
  //         client.mxcUrlToHttp(user.avatarUrl, 96, 96, "crop") ?? "";

  //       setAvatarUrl(httpUrl);
  //     } catch (error) {
  //       setAvatarUrl("");
  //       console.error("Error loading avatar:", error);
  //     }
  //   };

  //   fetchAvatar();
  // }, [client]);

  return (
    <>
      <div className="flex justify-between items-center relative bg-transparent py-2 px-2">
        <button
          onClick={() => router.back()}
          className="h-10 px-4 flex items-center gap-1 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/chat/${roomId}/info/edit`)}
            className="h-10 px-4 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
          >
            Edit
          </button>
          <button className="h-10 w-10 flex items-center justify-center border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out">
            <Ellipsis className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}