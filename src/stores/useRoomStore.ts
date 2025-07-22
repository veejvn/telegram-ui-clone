"use client";

import * as sdk from "matrix-js-sdk";
import { create } from "zustand";

interface Room {
  rooms: sdk.Room[];
  setRooms: (rooms: sdk.Room[]) => void;
  addRoomToTop: (room: sdk.Room) => void;
}

export const useRoomStore = create<Room>((set, get) => ({
  rooms: [],
  setRooms: (rooms: sdk.Room[]) => set({ rooms }),
  addRoomToTop: (room) =>
    set({
      rooms: [room, ...get().rooms.filter((r) => r.roomId !== room.roomId)],
    }),
}));
