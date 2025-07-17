/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Camera, Check, ChevronLeft, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { createPublicRoom } from "@/services/roomService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/ChatAvatar";
import { useAddMembersStore } from "@/stores/useAddMembersStore";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { selectedUsers, clearUsers } = useAddMembersStore();
  const client = useMatrixClient();
  const router = useRouter();

  const userIds = selectedUsers.map((user) => user.userId);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const handleCreate = async () => {
    if (!groupName.trim() || isCreating || !client) return;

    setIsCreating(true);

    const result = await createPublicRoom(
      groupName.trim(),
      client,
      avatarFile ? avatarFile : undefined,
      userIds
    );

    if ("roomId" in result) {
      router.push(`/chat/${result.roomId}`);
      clearUsers();
    } else {
      console.log("❌ Failed to create room: " + result.error);
    }
    setIsCreating(false);
  };

  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div style={headerStyle} className="min-h-screen bg-gray-200 dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 ">
        <Link href="/chat/newMessage/addMember">
          <div className="flex items-center text-blue-500 hover:opacity-70 cursor-pointer">
            <ChevronLeft size={22} className="mr-1" />
            <span className="text-base">Back</span>
          </div>
        </Link>
        <h1 className="text-md font-semibold text-center">New Group</h1>
        <button
          className={`text-base font-semibold cursor-pointer opacity-80 hover:opacity-40 ${
            groupName.trim() ? "text-blue-600" : "text-gray-400 disabled:true"
          }`}
          disabled={!groupName.trim() && true}
          onClick={handleCreate}
        >
          Create
        </button>
      </div>

      {/* Group Name Input */}
      <div className="dark:bg-[#181818] bg-white rounded-lg mx-4 mt-6 flex items-center px-4 py-4">
        <label className="w-14 h-14 rounded-full dark:bg-blue-900 bg-blue-100 flex items-center justify-center mr-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="file"
            onChange={handleAvatarChange}
          />
          {avatarFile ? (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Camera size={28} className="dark:text-blue-400 text-blue-600" />
          )}
        </label>
        <input
          value={groupName}
          type="text"
          placeholder="Group Name"
          className="bg-transparent outline-none text-lg dark:text-gray-400 placeholder-gray-500 flex-1"
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      {/* Auto-Delete Messages */}
      <div className="dark:bg-[#181818] bg-white rounded-lg mx-4 mt-6 px-2 py-3">
        <div className="flex items-center justify-between">
          <span className="text-base ps-3">Auto-Delete Messages</span>
          <span className="text-gray-400 flex justify-between items-center">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>
                  Off <ChevronsUpDown />
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Off
                    <MenubarShortcut>
                      <Check />
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    1 day
                    <MenubarShortcut>
                      <Check />
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    1 week
                    <MenubarShortcut>
                      <Check />
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    1 month
                    <MenubarShortcut>
                      <Check />
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Set Custom Time...
                    <MenubarShortcut>
                      <Check />
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mx-6 my-2">
        <p>
          Automatically delete messages in this group for everyone after a
          period of time.
        </p>
      </div>
      {selectedUsers.map((user) => (
        <div
          key={user.userId}
          className="dark:bg-[#181818] bg-white rounded-lg mx-4 mt-6 |
      px-2.5 py-1.5 flex gap-2 items-center"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.avatarUrl || ""}
              alt={user.avatarUrl ? "avatar" : "Unknown Avatar"}
            />
            {!user.avatarUrl && (
              <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
                {user.displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium -mb-1">{user.displayName}</p>
            <p className="text-gray-400 text-sm -mt-1">last seen recently</p>
          </div>
        </div>
      ))}
    </div>
  );
}
