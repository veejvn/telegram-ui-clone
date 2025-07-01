'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const phone = "";

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-black dark:bg-black dark:text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 text-sm font-medium">
        <button onClick={() => router.back()} className="text-sky-600 flex items-center gap-1">
          <ChevronLeft className="size-4" />
          Cancel
        </button>
        <span className="text-base font-semibold text-black dark:text-white">Edit Profile</span>
        <button className="text-sky-600">Done</button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-4">
        <div className="w-20 h-20 bg-blue-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
          <span className="text-2xl text-blue-500 dark:text-white">📷</span>
        </div>
        <p className="text-sky-600 text-sm mt-2 cursor-pointer">Set New Photo</p>
      </div>

      {/* Form */}
      <div className="space-y-4 px-4">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="w-full bg-white dark:bg-neutral-900 dark:text-white rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="w-full bg-white dark:bg-neutral-900 dark:text-white rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your name and add an optional profile photo.
        </p>

        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="w-full bg-white dark:bg-neutral-900 dark:text-white rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You can add a few lines about yourself. Choose who can see your bio in <span className="text-sky-600">Settings</span>.
        </p>

        {/* Date of Birth row */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm">Date of Birth</span>
          <span className="text-sky-600 text-sm">Add</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only your contacts can see your birthday. <span className="text-sky-600">Change ›</span>
        </p>

        {/* Info rows */}
        {[
          { label: "Change Number", value: phone },
          { label: "Username", value: "" },
          { label: "Your Color", value: "" }
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer"
          >
            <span className="text-sm">{item.label}</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm flex items-center space-x-1">
              {item.value && <span>{item.value}</span>}
              <ChevronRight size={18} />
            </span>
          </div>
        ))}

        {/* Add Another Account */}
        <div className="mt-4 space-y-2">
          <button className="w-full bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 text-sky-600 text-sm font-medium">
            Add Another Account
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            You can connect multiple accounts with different phone numbers.
          </p>
        </div>

        {/* Logout */}
        <button className="w-full bg-white dark:bg-neutral-900 rounded-lg px-4 py-3 text-red-500 text-sm font-medium mt-2">
          Log Out
        </button>
      </div>
    </div>
  );
}
