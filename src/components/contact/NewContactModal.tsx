"use client";

import { useState, useEffect } from "react";
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
  onClose?: () => void; // Thêm dòng này
  open?: boolean; // Thêm dòng này
  onOpenChange?: (open: boolean) => void; // Thêm dòng này
}

const NewContactModal = ({
  onAddContact,
  onClose,
  open,
  onOpenChange,
}: NewContactModalProps) => {
  // Nếu nhận open/onOpenChange từ cha thì dùng, không thì tự quản lý
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const modalOpen = isControlled ? open : internalOpen;
  const setModalOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);

  // Reset form mỗi khi modal đóng
  useEffect(() => {
    if (!modalOpen) {
      setFirstName("");
      setLastName("");
      setPhones([""]);
    }
  }, [modalOpen]);

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleAddPhone = () => setPhones([...phones, ""]);

  const handleRemovePhone = (idx: number) =>
    setPhones(phones.filter((_, i) => i !== idx));

  const handlePhoneChange = (idx: number, value: string) =>
    setPhones(phones.map((p, i) => (i === idx ? value : p)));

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhones([""]);
  };

  const handleCreate = () => {
    if (firstName.trim() && phones.some((p) => p.trim())) {
      onAddContact?.({ firstName, lastName, phones });
      setModalOpen(false);
      if (onClose) onClose();
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    resetForm();
    if (onClose) onClose();
  };

  const handleConfirmCancel = () => {
    resetForm();
    setShowConfirmCancel(false);
    setModalOpen(false);
    if (onClose) onClose();
  };

  const handleCloseConfirm = () => {
    setShowConfirmCancel(false);
  };

  const hasInput = firstName.trim() || lastName.trim() || phones.some((p) => p.trim());

  return (
    <>
      {/* Chỉ render nút + nếu không controlled từ cha */}
      {!isControlled && (
        <Button
          className="text-blue-500 border bg-transparent hover:bg-zinc-300"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md px-6 py-4">
          <DialogTitle />
          <DialogDescription />
          <div className="flex justify-between items-center text-sm mb-4">
            <Button
              onClick={handleCancel}
              className="text-blue-400 bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-800 px-1 shadow-none"
              type="button"
            >
              Cancel
            </Button>
            <h2 className="text-base font-semibold">New Contact</h2>
            <Button
              className="text-black bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-800 dark:text-white px-1 shadow-none"
              onClick={handleCreate}
              type="button"
            >
              Create
            </Button>
          </div>

          <div className="grid grid-flow-col grid-rows-2 mb-4">
            <div className="row-span-2 w-16 h-16 mt-3 mx-auto bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold">
              {firstName ? firstName[0].toUpperCase() : "C"}
            </div>
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-1 mb-2 placeholder:font-normal placeholder:text-gray-600"
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-1 mb-2 placeholder:font-normal placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {phones.map((phone, idx) => (
              <div className="flex items-center gap-2" key={idx}>
                <Button
                  type="button"
                  size="icon"
                  className="bg-red-500 text-white size-5 hover:bg-red-300 rounded-full flex-shrink-0"
                  onClick={() => handleRemovePhone(idx)}
                  disabled={phones.length === 1}
                  tabIndex={-1}
                >
                  <CircleMinus className="size-full" />
                </Button>
                <span className="text-blue-500  text-sm w-16 select-none">
                  mobile
                </span>
                <Input
                  className="flex-1 placeholder:font-normal placeholder:text-gray-600"
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
                className="bg-blue-500 hover:bg-blue-300 my-2 size-5 rounded-full flex-shrink-0"
                onClick={handleAddPhone}
              >
                <CirclePlus className="size-ful" />
              </Button>
              <span className="content-center text-blue-400 text-sm select-none">
                add phone
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewContactModal;
