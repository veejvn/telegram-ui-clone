import React from "react";
import { Button } from "@/components/ui/button";

interface DeleteChatModalProps {
  open: boolean;
  onClose: () => void;
  onDeleteMine: () => void;
  onDeleteBoth: () => void;
}

const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  open,
  onClose,
  onDeleteMine,
  // onDeleteBoth,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white w-full rounded-t-2xl p-4 max-w-md">
        {/* <Button
          className="w-full text-red-600 font-semibold mb-2"
          variant="ghost"
          onClick={onDeleteBoth}
        >
          Delete from both sides
        </Button> */}
        <Button
          className="w-full text-red-600 font-semibold mb-2"
          variant="ghost"
          onClick={onDeleteMine}
        >
          Delete for me
        </Button>
        <Button className="w-full" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteChatModal;