"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { useAuthStore } from "@/stores/useAuthStore";
import { callService } from "@/services/callService";
import { useUserStore } from "@/stores/useUserStore";

export default function EditProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearUser = useUserStore.getState().clearUser;

  const handleLogout = async () => {
    try {
      const authService = new MatrixAuthService();
      authService.logout();
      logout();
      clearUser(); // ✅ Cleanup callService
      if (callService) {
        try {
          callService.hangup(); // End any active calls
          // callService sẽ tự cleanup khi không có auth data
        } catch (error) {
          console.warn("CallService cleanup warning:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Ngay cả khi có lỗi, vẫn force clear và redirect
      logout();
      clearUser();
      window.location.href = "/chat/login";
    }
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const phone = "";

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-black dark:bg-black dark:text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 text-sm font-medium">
        <button
          onClick={() => router.back()}
          className="text-sky-600 flex items-center gap-1"
        >
          Cancel
        </button>
        <button className="text-sky-600">Done</button>
      </div>

      {/* Avatar - iOS style */}
      <div className="flex flex-col items-center mt-2 mb-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#e5f0ff] dark:bg-[#0c0c12]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-[#007aff] dark:text-[#4aa3ff]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-2.6-5.1.3-.4c.3-.4.8-.8 1.4-.8h2.8c.6 0 1.1.3 1.4.8l.3.4.7 1H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1.9l.7-1Zm6.6 7.6a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
          </svg>
        </div>
        <p className="text-[#007aff] text-sm mt-2 font-medium cursor-pointer dark:text-[#4aa3ff]">
          Set New Photo
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 px-4 pb-10">
        {/* Combined First + Last Name Field */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full px-4 pt-3 pb-2 text-sm font-medium text-black dark:text-white bg-transparent focus:outline-none"
          />
          <div className="h-px bg-gray-200 dark:bg-neutral-700" />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full px-4 pt-2 pb-3 text-sm text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your name and add an optional profile photo.
        </p>

        {/* Bio */}
        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="w-full bg-white dark:bg-neutral-900 dark:text-white rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You can add a few lines about yourself. Choose who can see your bio in{" "}
          <span className="text-sky-600">Settings</span>.
        </p>

        {/* Date of Birth */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm">Date of Birth</span>
          <span className="text-gray-500 text-sm">Add</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only your contacts can see your birthday.{" "}
          <span className="text-sky-600">Change ›</span>
        </p>

        {/* Info Rows - grouped with dividers and rounded corners */}
        <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
          <div className="flex justify-between items-center px-4 py-3 cursor-pointer">
            <span className="text-sm text-black dark:text-white">
              Change Number
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
              {phone}
              <ChevronRight size={18} />
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 cursor-pointer">
            <span className="text-sm text-black dark:text-white">Username</span>
            <ChevronRight
              size={18}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
          <div className="flex justify-between items-center px-4 py-3 cursor-pointer">
            <span className="text-sm text-black dark:text-white">
              Your Color
            </span>
            <ChevronRight
              size={18}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
        </div>

        {/* Add Another Account */}
        <div className="space-y-2">
          <button className="w-full bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 text-sky-600 text-sm font-medium">
            Add Another Account
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can connect multiple accounts with different phone numbers.
          </p>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger className="w-full bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 text-red-500 text-sm font-medium text-center">
            Log Out
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to log out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will need to log in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-200 dark:bg-zinc-800 dark:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-zinc-200 text-red-500 dark:bg-zinc-800"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
