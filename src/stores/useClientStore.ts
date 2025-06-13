import { MatrixClient } from "matrix-js-sdk";
import { create } from "zustand";

export interface IClientState {
  client: MatrixClient | null;
  setClient: (client: MatrixClient) => void;
  clearCLient: () => void;
}

export const useClientStore = create<IClientState>((set) => ({
  client: null,
  setClient: (newClient) => set({ client: newClient }),
  clearCLient: () => set({ client: null }),
}));
