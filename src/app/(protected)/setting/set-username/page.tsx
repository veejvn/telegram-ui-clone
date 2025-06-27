"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { useUserStore } from "@/stores/useUserStore";
export default function SetUsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const handleSave = async () => {
    try {
      const authService = new MatrixAuthService();

      const userId = authService.client.getUserId();
      if (!userId || !userId.startsWith("@")) {
        throw new Error("Invalid User ID: " + userId);
      }

      await authService.updateProfile(username);
      console.log("Display name updated on server:", username);
      const profile = await authService.client.getProfileInfo(userId);

      console.log("New Profile:", profile);

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
        <Button onClick={() => router.back()} className="text-blue-500 text-sm bg-white hover:bg-zinc-300 border dark:bg-black dark:hover:bg-zinc-700">
          Cancel
        </Button>
        <h1 className="text-lg font-semibold">Username</h1>
        <Button
          size="sm"
          className="text-blue-500 bg-white hover:bg-zinc-300 border dark:bg-black dark:hover:bg-zinc-700"
          onClick={handleSave}
        >
          Done
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm mb-1 block">USERNAME</label>
          <Input
            className="border placeholder:text-gray-500"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          You can choose a username on Telegram. If you do, people will be able
          to find you by this username and contact you without needing your
          phone number.
        </p>
        <p className="text-xs text-gray-400">
          You can use <strong>a–z, 0–9</strong> and underscores. Minimum length
          is <strong>5 characters</strong>.
        </p>
        <p className="text-xs text-gray-400">
          This link opens a chat with you:{" "}
          <a
            href={`https://t.me/${username}`}
            className="text-blue-400 underline"
          >
            https://t.me/
          </a>
        </p>
      </div>
    </div>
  );
}
