"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function SetUsernamePage() {
  const router = useRouter();
  const [displayName, setDisplayname] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const userId = useAuthStore((state) => state.userId);
  const client = useMatrixClient();

  const handleSave = async () => {
    try {
      if (!client || !userId || !userId.startsWith("@")) return

      await client.setDisplayName(displayName);
      const profile = await client.getProfileInfo(userId);

      setUser({
        displayName: profile.displayname ?? "",
      });

      router.back();
    } catch (error) {
      console.error(" Profile update error:", error);
      alert("Username update failed.");
    }
  };


  return (
    <div className="min-h-screen px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-500 text-sm font-medium"
        >
          Cancel
        </button>

        <h1 className="text-lg font-semibold">Username</h1>

        <button
          onClick={handleSave}
          className="text-blue-500 text-sm font-medium"
        >
          Done
        </button>
      </div>


      <div className="space-y-4">
        <label className="text-xs text-zinc-500 font-medium mb-1 block">USERNAME</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-black dark:text-white pointer-events-none">
            Username
          </span>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayname(e.target.value)}
            className="pl-[100px] pr-3 py-2 text-base rounded-md border border-zinc-300 dark:border-zinc-700 caret-blue-500"
          />
        </div>


        <p className="text-xs text-gray-400 leading-relaxed">
          You can choose a username on Telegram. If you do, people will be able
          to find you by this username and contact you without needing your
          phone number.
        </p>
        <p className="text-xs text-gray-400">
          You can use <strong>a–z, 0–9</strong> and underscores. Minimum length
          is <strong>5 </strong>characters.
        </p>
        <p className="text-xs text-gray-400">
          <span>This link opens a chat with you:</span>
          <br />
          <a
            href={`https://t.me/${displayName}`}
            className="text-blue-400 underline"
          >
            https://t.me/{displayName}
          </a>
        </p>

      </div>
    </div>
  );
}
