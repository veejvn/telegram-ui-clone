import React from "react";
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

export default function CreateGroupPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/chat/newMessage">
          <div className="flex items-center text-blue-500 hover:opacity-70 cursor-pointer">
            <ChevronLeft size={22} className="mr-1" />
            <span className="text-base">Back</span>
          </div>
        </Link>
        <h1 className="text-md font-semibold text-center">New Group</h1>
        <button
          className="text-white text-base font-semibold cursor-pointer
          opacity-80 hover:opacity-40"
        >
          Create
        </button>
      </div>

      {/* Group Name Input */}
      <div className="bg-[#181818] rounded-lg mx-4 mt-6 flex items-center px-4 py-4">
        <label className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center mr-4 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" aria-label="file"/>
          <Camera size={28} className="text-blue-400" />
        </label>
        <input
          type="text"
          placeholder="Group Name"
          className="bg-transparent outline-none text-lg text-gray-400 placeholder-gray-500 flex-1"
        />
      </div>

      {/* Auto-Delete Messages */}
      <div className="bg-[#181818] rounded-lg mx-4 mt-6 px-2 py-3">
        <div className="flex items-center justify-between">
          <span className="text-base">Auto-Delete Messages</span>
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
    </div>
  );
}
