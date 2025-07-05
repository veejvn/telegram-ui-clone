"use client";

import {
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const privacyItemsTop = [
  {
    icon: (
      <Image
        src="/icons-privacy/block.png"
        alt="Blocked Users"
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-contain"
      />
    ),
    label: "Blocked Users",
    value: "None",
    bg: "#FF3B30",
  },
  {
    icon: (
      <Image
        src="/icons-privacy/faceid.png"
        alt="Blocked Users"
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-contain"
      />
    ),
    label: "Passcode & Face ID",
    value: "Off",
    bg: "#31C75A",
  },
  {
    icon: (
      <Image
        src="/icons-privacy/key.png"
        alt="Blocked Users"
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-contain"
      />
    ),
    label: "Two-Step Verification",
    value: "Off",
    bg: "#FF9702",
  },
  {
    icon: (
      <Image
        src="/icons-privacy/time.png"
        alt="Blocked Users"
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-contain"
      />
    ),
    label: "Auto-Delete Messages",
    value: "Off",
    bg: "#AF52DE",
  },
];

const privacyItems = [
  { label: "Phone Number", value: "My Contacts" },
  { label: "Last Seen & Online", value: "Everybody" },
  { label: "Profile Photos", value: "Everybody" },
  { label: "Bio", value: "Everybody" },
  { label: "Gifts", value: "Mini Apps" },
  { label: "Date of Birth", value: "My Contacts" },
  { label: "Forwarded Messages", value: "Everybody" },
  { label: "Calls", value: "Everybody" },
  { label: "Voice Messages", value: "Everybody" },
  { label: "Messages", value: "Everybody" },
  { label: "Invites", value: "Everybody" },
];

export default function PrivacyAndSecurityPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f6f6f6] dark:bg-black min-h-screen text-black dark:text-white px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="text-blue-400 mr-4 cursor-pointer"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">
          Privacy and Security
        </h1>
        <div className="w-12" />
      </div>

      {/* Top Section */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white mb-4">
        {privacyItemsTop.map((item, idx) => (
          <div key={item.label}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-lg shadow-sm"
                  style={{ backgroundColor: item.bg }}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-400 text-sm">{item.value}</span>
                <ChevronRight className="text-zinc-400" size={18} />
              </div>
            </div>
            {idx < privacyItemsTop.length - 1 && (
              <div className="border-t border-gray-200 dark:border-zinc-800 ml-16" />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400 px-4 pb-3 mb-4">
        Automatically delete messages for everyone after a period of time in all
        new chats you start.
      </p>

      {/* Login Email */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white mb-4 divide-y divide-gray-200 dark:divide-zinc-800">
        <div className="flex items-center px-4 py-3 space-x-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-lg shadow-sm"
            style={{ backgroundColor: "#5955D5" }}
          >
            <Image
              src="/icons-privacy/mail.png"
              alt="Blocked Users"
              width={50}
              height={50}
              className="w-9 h-9 object-contain rounded-[10px]"
            />
          </div>
          <span>Login Email</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 px-4 pb-3 mb-4">
        Change your email address for Hii Chat login codes.
      </p>

      {/* Privacy Section */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white mb-4 divide-y divide-gray-200 dark:divide-zinc-800">
        <div className="text-xs text-zinc-400 px-4 pt-3 pb-1">PRIVACY</div>
        {privacyItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3"
          >
            <span>{item.label}</span>
            <div className="flex items-center space-x-1">
              <span className="text-zinc-400 text-sm">{item.value}</span>
              <ChevronRight className="text-zinc-400" size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Restrict Info */}
      <p className="text-xs text-zinc-400 px-4 mb-6">
        You can restrict which users are allowed to add you to groups and
        channels.
      </p>

      {/* Auto Delete Section */}
      <div className="text-xs text-zinc-400 px-4 pt-3 pb-1">
        AUTOMATICALLY DELETE MY ACCOUNT
      </div>
      <div className="rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white mb-4 divide-y divide-gray-200 dark:divide-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <span>If Away For</span>
          <div className="flex items-center space-x-1 text-zinc-400 text-sm">
            <span>18 months</span>
            <ChevronRight />
          </div>
        </div>
      </div>
      <p className="text-xs text-zinc-400 px-4 pb-3 mb-4">
        If you do not come online at least once within this period, your account
        will be deleted along with all messages and contacts.
      </p>

      {/* Data Settings */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white mb-4 divide-y divide-gray-200 dark:divide-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <span>Data Settings</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 px-4 pb-3">
        Control which of your data is stored in the cloud and used by Telegram
        to enable advanced features.
      </p>
    </div>
  );
}
