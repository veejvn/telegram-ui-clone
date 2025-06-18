"use client"
import * as sdk from "matrix-js-sdk";
import { create } from "zustand";

export interface IClientState {
  client: sdk.MatrixClient | null;
  setClient: (client: sdk.MatrixClient) => void;
  clearCLient: () => void;
}

export const useClientStore = create<IClientState>((set) => ({
  client: null,
  setClient: (newClient) => set({ client: newClient }),
  clearCLient: () => set({ client: null }),
}));
