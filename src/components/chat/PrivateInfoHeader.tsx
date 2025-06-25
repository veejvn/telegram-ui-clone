/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Avatar, AvatarFallback } from "../ui/ChatAvatar";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";

export default function PrivateInfoHeader({ user }: { user: sdk.User }) {
  const router = useRouter();

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
            <AvatarFallback className="bg-purple-400 text-white text-5xl font-bold">
              {user.displayName?.slice(0, 1)}
            </AvatarFallback>
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
