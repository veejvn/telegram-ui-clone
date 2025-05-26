"use client";

import { Fragment } from "react";
import { useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const ContactPage = () => {
  const [sortBy, setSortBy] = useState<"lastSeen" | "name">("name");

  return (
    <Fragment>
      <div className="bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="text-blue-500 p-0 bg-transparent hover:bg-transparent">
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 bg-[#1a1a1a] text-white p-0 rounded-2xl ml-3">
              <div className="flex flex-col">
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-[#1a1a1a] hover:bg-[#232323] transition text-left rounded-t-2xl ${
                    sortBy === "lastSeen" ? "font-semibold text-white" : ""
                  }`}
                  onClick={() => setSortBy("lastSeen")}
                >
                  By Last Seen
                  {sortBy === "lastSeen" && <span>✔</span>}
                </Button>
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-[#1a1a1a] hover:bg-[#232323] transition text-left rounded-b-2xl ${
                    sortBy === "name" ? "font-semibold text-white" : ""
                  }`}
                  onClick={() => setSortBy("name")}
                >
                  By Name
                  {sortBy === "name" && <span>✔</span>}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="flex gap-3">
            <Button
              size="icon"
              className="text-blue-500 bg-transparent hover:bg-transparent"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <SearchBar />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
        <div className="mb-4">
          <Image
            src="/images/contact.png"
            alt="Contacts Icon"
            className="mx-auto"
            width={120}
            height={120}
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">Access to Contacts</h2>
        <p className="text-gray-400 mb-6">
          Please allow Telegram access to your phonebook to seamlessly find all
          your friends.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full py-6 bg-blue-500 text-white hover:bg-blue-600">
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
              <AlertDialogAction className="bg-[#1a1a1a] text-blue-500 hover:bg-transparent border-l border-black rounded-none">
                Setting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="link" className="text-blue-500 mt-16">
          Privacy Policy
        </Button>
      </div>
    </Fragment>
  );
};

export default ContactPage;
