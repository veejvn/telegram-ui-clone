"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePlus, Plus, CircleMinus } from "lucide-react";

export interface NewContactModalProps {
  onAddContact?: (contact: {
    firstName: string;
    lastName: string;
    phones: string[];
  }) => void;
}

const NewContactModal = ({ onAddContact }: NewContactModalProps) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);

  const handleAddPhone = () => setPhones([...phones, ""]);

  const handleRemovePhone = (idx: number) =>
    setPhones(phones.filter((_, i) => i !== idx));

  const handlePhoneChange = (idx: number, value: string) =>
    setPhones(phones.map((p, i) => (i === idx ? value : p)));

  const handleCreate = () => {
    if (firstName.trim() && phones.some((p) => p.trim())) {
      onAddContact?.({ firstName, lastName, phones });
      setFirstName("");
      setLastName("");
      setPhones([""]);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        className="text-blue-500 bg-transparent hover:bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black text-white max-w-md p-6">
          <DialogTitle/>
          <DialogDescription/>
          <div className="flex justify-between items-center text-sm mb-4">
            <Button
              onClick={() => setOpen(false)}
              className="text-blue-400 bg-transparent hover:bg-transparent px-0"
              type="button"
            >
              Cancel
            </Button>
            <h2 className="text-base font-semibold">New Contact</h2>
            <Button
              className="text-white bg-transparent hover:bg-transparent px-0"
              onClick={handleCreate}
              type="button"
            >
              Create
            </Button>
          </div>

          <div className="grid grid-flow-col grid-rows-2 mb-4">
            <div className="row-span-2 w-16 h-16 mt-3 mx-auto bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold">
              {firstName ? firstName[0].toUpperCase() : "C"}
            </div>
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-1 mb-2 bg-zinc-900 text-white"
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-1 mb-2 bg-zinc-900 text-white"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {phones.map((phone, idx) => (
              <div className="flex items-center gap-2" key={idx}>
                <Button
                  type="button"
                  size="icon"
                  className="bg-red-500 text-white size-5 rounded-full flex-shrink-0"
                  onClick={() => handleRemovePhone(idx)}
                  disabled={phones.length === 1}
                  tabIndex={-1}
                >
                  <CircleMinus className="size-full" />
                </Button>
                <span className="text-blue-400 text-sm w-16 select-none">di động</span>
                <Input
                  className="flex-1 bg-zinc-900 text-white"
                  placeholder="+"
                  value={phone}
                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                  type="tel"
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                className="bg-blue-500 text-white my-2 size-5 rounded-full flex-shrink-0"
                onClick={handleAddPhone}
              >
                <CirclePlus className="size-ful" />
              </Button>
              <span className="content-center text-blue-400 text-sm select-none">add phone</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewContactModal;
