"use client";
import InfoBody from "@/components/chat/InfoBody";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserInfoInPrivateRoom } from "@/services/chatService";
import PrivateInfoHeader from "@/components/chat/PrivateInfoHeader";

export default function InfoPage() {
  const params = useParams();
  const roomId = decodeURIComponent(params.id as string);
  const client = useMatrixClient();
  const [user, setUser] = useState<sdk.User | undefined>(undefined);

  useEffect(() => {
    if (!roomId || !client) return;

    getUserInfoInPrivateRoom(roomId, client)
      .then((res) => {
        if (res.success) {
          setUser(res.user);
        } else {
          console.log("Error: ", res.err);
        }
      })
      .catch((res) => {
        console.log("Error: ", res.err);
      });
  }, [roomId, client]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M44 24c0-11.046-8.954-20-20-20v8a12 12 0 0112 12h8z"
          />
        </svg>
        <span className="text-lg text-gray-600 font-semibold">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen w-full">
      <header className="mb-23">
        <PrivateInfoHeader user={user} />
      </header>
      <div>
        <InfoBody user={user} />
      </div>
    </div>
  );
}
