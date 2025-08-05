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
import { ScrollArea } from "@/components/ui/scroll-area";
import useAllRoomUsers from "@/hooks/useAllRoomUsers";
import { useAddMembersStore } from "@/stores/useAddMembersStore";
import { createPublicRoom } from "@/services/roomService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import {
  ChevronLeft,
  Search,
  Sparkles,
  Link as LinkIcon,
  Users2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const router = useRouter();
  const users = useAllRoomUsers();
  const { selectedUsers, clearUsers } = useAddMembersStore();
  const client = useMatrixClient();
  const [showModal, setShowModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // const handleSettingClick = () => {
  //   router.push("/setting");
  // };

  // const headerStyle = getHeaderStyleWithStatusBar();

  const handleCreateGroup = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCreateRoom = async () => {
    if (isCreating || !client || selectedUsers.length === 0) return;

    setIsCreating(true);

    const userIds = selectedUsers.map((user) => user.userId);
    const groupName = "Group name";

    const result = await createPublicRoom(
      groupName,
      client,
      undefined, // no avatar file
      userIds
    );

    if ("roomId" in result) {
      router.push(`/chat/${result.roomId}`);
      clearUsers();
    } else {
      console.log("❌ Failed to create room: " + result.error);
    }
  };

  return (
    // <>
    //   <div
    //     style={headerStyle}
    //     className="flex items-center justify-between px-2 py-3 dark:bg-[#1a1a1a]"
    //   >
    //     <div className="flex text-blue-600 hover:opacity-70">
    //       <Link
    //         href={"/chat/newMessage"}
    //         className="flex text-blue-600
    //     cursor-pointer hover:opacity-70"
    //       >
    //         <ChevronLeft />
    //         <p>Back</p>
    //       </Link>
    //     </div>
    //     <h1 className="text-md font-semibold text-center flex-1">New Group</h1>
    //     <div className="flex text-blue-600 hover:opacity-70">
    //       <Link
    //         href={"/chat/newMessage/createGroup"}
    //         className="flex text-blue-600
    //     cursor-pointer hover:opacity-70"
    //       >
    //         <p>Next</p>
    //       </Link>
    //     </div>
    //   </div>
    //   <AddMemberBar />
    //   <>
    //     {users && users.length > 0 ? (
    //       <UserList users={users} />
    //     ) : (
    //       <div className="flex flex-1 flex-col justify-center items-center px-6 text-center">
    //         <div className="mt-10 mb-8">
    //           <Image
    //             src="/images/contact.png"
    //             alt="Contacts Icon"
    //             className="mx-auto"
    //             width={300}
    //             height={300}
    //             style={{ height: "auto", width: "auto" }}
    //             loading="eager"
    //             priority
    //           />
    //         </div>
    //         <h2 className="text-xl font-semibold my-4">Access to Contacts</h2>
    //         <p className="text-gray-400 mb-6">
    //           Please allow Telegram access to your phonebook to seamlessly find
    //           all your friends.
    //         </p>
    //         <AlertDialog>
    //           <AlertDialogTrigger asChild>
    //             <Button className="w-full sm:w-32 py-6 bg-blue-500 text-white hover:bg-blue-600">
    //               Allow Access
    //             </Button>
    //           </AlertDialogTrigger>
    //           <AlertDialogContent className="w-56 h-40 bg-[#1a1a1a] text-white border-0 p-0">
    //             <AlertDialogHeader className="pt-4">
    //               <AlertDialogTitle className="text-base text-center">
    //                 Please Allow Access
    //               </AlertDialogTitle>
    //               <AlertDialogDescription className="text-sm text-center">
    //                 Telegram does not have access to your contacts
    //               </AlertDialogDescription>
    //             </AlertDialogHeader>
    //             <AlertDialogFooter className="grid grid-cols-2 w-full border-t border-black gap-0">
    //               <AlertDialogCancel className="bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-r border-black rounded-none">
    //                 Not Now
    //               </AlertDialogCancel>
    //               <AlertDialogAction
    //                 onClick={() => handleSettingClick()}
    //                 className="bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-l border-black rounded-none"
    //               >
    //                 Setting
    //               </AlertDialogAction>
    //             </AlertDialogFooter>
    //           </AlertDialogContent>
    //         </AlertDialog>
    //         <Button variant="link" className="text-blue-500 my-8">
    //           Privacy Policy
    //         </Button>
    //       </div>
    //     )}
    //   </>
    // </>

    <>
      <div className="px-3">
        {/* header */}
        <div className="relative flex items-center h-[50px]">
          <button
            className="flex items-center justify-center cursor-pointer hover:opacity-70 bg-white/60 rounded-full p-1 border border-white
      bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 
      backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
            <p className="font-semibold text-center">Create Group</p>
          </div>
        </div>

        {/* body */}
        <div className="mt-3">
          {/* searchbar */}
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm mọi thứ bằng AI"
              className="w-full pl-12 pr-12 py-3 placeholder:text-xs rounded-full border-0 focus:outline-none 
               bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100
               dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30
               text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
               shadow-sm/10 backdrop-blur-sm placeholder:italic"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* Group link */}
          <div className="bg-white/30 rounded-2xl p-4 mb-6 border border-white shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                    Create group with link
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    People can join your group using the link
                  </p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </div>

          {/* user list */}
          {users && users.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Recommended by friends</p>
              <div className="h-[375px]">
                <ScrollArea className="h-full">
                  <UserList users={users} />
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8">
        <button
          className="w-full font-medium py-4 px-6 rounded-full transition-colors duration-200 
             shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleCreateGroup}
        >
          Begin group conversation{" "}
          {selectedUsers.length > 0 && `(${selectedUsers.length})`}
        </button>
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-sm shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Create group with link
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 bg-gray-400/60 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="text-center px-6 ">
              <h3 className=" font-bold text-gray-900 dark:text-white mb-2">
                Create new group
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                People can join your group using the link.
              </p>

              {/* Icon */}
              <div className="mt-1">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <div className="text-blue-600">
                    <Users2 size={40} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-4 pb-8">
              <button
                className={`w-full font-medium py-4 px-6 rounded-full transition-colors duration-200 text-white
                 shadow-[0_8px_24px_0_rgba(0,0,0,0.12),0_-8px_24px_0_rgba(0,0,0,0.12)] shadow-blue-600/30 ${
                   isCreating || selectedUsers.length === 0
                     ? "bg-gray-400 cursor-not-allowed"
                     : "bg-blue-600 hover:bg-blue-700"
                 }`}
                onClick={handleCreateRoom}
                disabled={isCreating || selectedUsers.length === 0}
              >
                {isCreating ? "Creating..." : "Create group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
