"use client";
import SearchBar from "@/components/layouts/SearchBar";
import Link from "next/link";
import { Users, UserPlus, Megaphone } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/ChatSeparator";
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
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleSettingClick = () => {
    router.push("/setting");
  };
  return (
    <>
      <div className=" dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex text-blue-600 hover:opacity-70">
            <Link href={"/chat"}>Cancel</Link>
          </div>
          <h1 className="text-md font-semibold text-center flex-1">
            New Message
          </h1>
          <div className="w-[60px]"></div>
        </div>
        <SearchBar />
      </div>

      <div className="flex flex-col ">
        <Link href={"/chat/newMessage/addMember"}>
          <div className="dark:hover:bg-[#181818] hover:bg-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 ">
              <Users size={24} className="text-blue-500" />
              <span className="text-blue-500 text-base">New Group</span>
            </div>
            <div className="pl-[56px]">
              <Separator className="w-[110px] opacity-30" />
            </div>
          </div>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="dark:hover:bg-[#181818] hover:bg-gray-200">
              <div className="flex items-center gap-3 px-4 py-3 ">
                <UserPlus size={24} className="text-blue-500" />
                <span className="text-blue-500 text-base">New Contact</span>
              </div>
              <div className="pl-[56px]">
                <Separator className="w-[110px] opacity-30" />
              </div>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-56 h-40 dark:bg-[#1a1a1a] dark:text-white border-0 p-0">
            <AlertDialogHeader className="pt-4">
              <AlertDialogTitle className="text-base text-center">
                Please Allow Access
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-center">
                Telegram does not have access to your contacts
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="grid grid-cols-2 w-full border-t border-black gap-0">
              <AlertDialogCancel className="dark:bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-r dark:border-black rounded-none">
                Not Now
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleSettingClick()}
                className="bg-white dark:bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-l dark:border-black rounded-none"
              >
                Setting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Link href={"/chat/newMessage/createChannel"}>
          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer dark:hover:bg-[#181818] hover:bg-gray-200">
            <Megaphone size={24} className="text-blue-500" />
            <span className="text-blue-500 text-base">New Channel</span>
          </div>
        </Link>
      </div>
    </>
  );
}
