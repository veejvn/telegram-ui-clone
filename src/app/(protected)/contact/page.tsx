"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/layouts/SearchBar";
import NewContactModal from "@/components/contact/NewContactModal";
import { Avatar } from "@/components/ui/avatar";
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

interface Contact {
  firstName: string;
  lastName: string;
  phones: string[];
}

const ContactPage = () => {
  const [sortBy, setSortBy] = useState<"lastSeen" | "name">("name");
  const [contacts, setContacts] = useState<Contact[]>([]);

  const handleAddContact = (contact: Contact) => {
    setContacts((prev) => [...prev, contact]);
  };

  const handleDeleteContact = (idx: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  const router = useRouter();

  const handleSettingClick = () => {
    router.push("/setting");
  };

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between px-4 py-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="text-blue-500 border bg-transparent hover:bg-zinc-300">
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0 ml-3 rounded-2xl">
              <div className="flex flex-col">
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-white text-black hover:bg-zinc-300 text-left rounded-none rounded-t-2xl ${
                    sortBy === "lastSeen" ? "font-bold" : ""
                  }`}
                  onClick={() => setSortBy("lastSeen")}
                >
                  By Last Seen
                  {sortBy === "lastSeen" && <Check />}
                </Button>
                <Button
                  className={`flex items-center justify-between px-4 py-2 bg-white text-black hover:bg-zinc-300 text-left rounded-none rounded-b-2xl ${
                    sortBy === "name" ? "font-bold" : ""
                  }`}
                  onClick={() => setSortBy("name")}
                >
                  By Name
                  {sortBy === "name" && <Check />}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="flex gap-3">
            <NewContactModal onAddContact={handleAddContact} />
          </div>
        </div>
        <SearchBar />
      </div>
      <div className="px-4 py-2">
        {contacts.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center items-center px-6 text-center">
            <div className="size-30 mt-10 mb-8">
              <Image
                src="/images/contact.png"
                alt="Contacts Icon"
                width={120}
                height={120}
                style={{ height: "120px", width: "auto" }}
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
              <AlertDialogContent className="w-56 h-40 border-0 p-0">
                <AlertDialogHeader className="pt-4">
                  <AlertDialogTitle className="text-base text-center">
                    Please Allow Access
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-center">
                    Telegram does not have access to your contacts
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 w-full border-t gap-0">
                  <AlertDialogCancel className="h-full text-blue-500 bg-white hover:bg-zinc-300 dark:bg-black border-r rounded-none rounded-bl-lg">
                    Not Now
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleSettingClick()}
                    className="h-full text-blue-500 bg-white hover:bg-zinc-300 dark:bg-black border-l rounded-none rounded-br-lg"
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
        ) : (
          <ul className="divide-y divide-gray-400">
            {contacts.map((c, idx) => (
              <li key={idx} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white">
                  {(c.firstName?.[0] || c.lastName?.[0] || "C").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {c.phones.filter(Boolean).join(", ")}
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  className="bg-transparent hover:bg-transparent"
                  onClick={() => handleDeleteContact(idx)}
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ContactPage;
