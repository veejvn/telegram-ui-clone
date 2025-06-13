import * as sdk from "matrix-js-sdk";
import { create } from "zustand";

interface Room {
  room: sdk.Room | null;
  setRoom: (room: sdk.Room) => void;
}

export const useRoomStore = create<Room>((set) => ({
  room: null,
  setRoom: (room: sdk.Room) => set({ room }),
}));
