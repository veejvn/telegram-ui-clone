import { RoomUser } from "@/hooks/useAllRoomUsers";
import { create } from "zustand";

interface AddMembersStore {
  selectedUsers: RoomUser[];
  toggleUser: (user: RoomUser) => void;
  clearUsers: () => void;
}

export const useAddMembersStore = create<AddMembersStore>((set, get) => ({
  selectedUsers: [],

  toggleUser: (user) => {
    const current = get().selectedUsers;
    const exists = current.find((u) => u.userId === user.userId);

    set({
      selectedUsers: exists
        ? current.filter((u) => u.userId !== user.userId)
        : [...current, user],
    });
  },

  clearUsers: () => set({ selectedUsers: [] }),
}));
