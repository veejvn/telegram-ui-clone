"use client";
import AddMemberBar from "@/components/chat/AddMemberBar";
import UserList from "@/components/common/UserList";
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
import { Button } from "@/components/ui/button";
import useAllRoomUsers from "@/hooks/useAllRoomUsers";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const router = useRouter();
  const users = useAllRoomUsers();
  const handleSettingClick = () => {
    router.push("/setting");
  };

  return (
    <>
      <div className="flex items-center justify-between px-2 py-3 dark:bg-[#1a1a1a]">
        <div className="flex text-blue-600 hover:opacity-70">
          <Link
            href={"/chat/newMessage"}
            className="flex text-blue-600
        cursor-pointer hover:opacity-70"
          >
            <ChevronLeft />
            <p>Back</p>
          </Link>
        </div>
        <h1 className="text-md font-semibold text-center flex-1">New Group</h1>
        <div className="flex text-blue-600 hover:opacity-70">
          <Link
            href={"/chat/newMessage/createGroup"}
            className="flex text-blue-600
        cursor-pointer hover:opacity-70"
          >
            <p>Next</p>
          </Link>
        </div>
      </div>
      <AddMemberBar />
      <>
        {users && users.length > 1 ? (
          <UserList users={users} />
        ) : (
          <div className="flex flex-1 flex-col justify-center items-center px-6 text-center">
            <div className="mt-10 mb-8">
              <Image
                src="/images/contact.png"
                alt="Contacts Icon"
                className="mx-auto"
                width={300}
                height={300}
                style={{ height: "auto", width: "auto" }}
                loading="eager"
                priority
              />
            </div>
            <h2 className="text-xl font-semibold my-4">Access to Contacts</h2>
            <p className="text-gray-400 mb-6">
              Please allow Telegram access to your phonebook to seamlessly find
              all your friends.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-32 py-6 bg-blue-500 text-white hover:bg-blue-600">
                  Allow Access
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-56 h-40 bg-[#1a1a1a] text-white border-0 p-0">
                <AlertDialogHeader className="pt-4">
                  <AlertDialogTitle className="text-base text-center">
                    Please Allow Access
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-center">
                    Telegram does not have access to your contacts
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 w-full border-t border-black gap-0">
                  <AlertDialogCancel className="bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-r border-black rounded-none">
                    Not Now
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleSettingClick()}
                    className="bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-l border-black rounded-none"
                  >
                    Setting
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="link" className="text-blue-500 my-8">
              Privacy Policy
            </Button>
          </div>
        )}
      </>
    </>
  );
}
