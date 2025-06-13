"use client";

import * as sdk from "matrix-js-sdk";
import { create } from "zustand";
import { getLS } from "@/tools/localStorage.tool";
import { IClientState } from "@/types/matrix";

//const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
const HOMESERVER_URL: string = "https://matrix.org";

export const useClientStore = create<IClientState>((set) => ({
  client: null,
  setClient: (newClient) => set({ client: newClient }),
  clearCLient: () => set({ client: null }),
  restoreClient: () => {
    const accessToken = getLS("matrix_access_token");
    const userId = getLS("matrix_user_id");
    if (accessToken && userId) {
      const client = sdk.createClient({
        baseUrl: HOMESERVER_URL,
        accessToken,
        userId,
      });
      set({ client });
    }
  },
}));