"use client"

import * as sdk from "matrix-js-sdk";

export interface IClientState {
  client: sdk.MatrixClient | null;
  setClient: (client: sdk.MatrixClient) => void;
  clearCLient: () => void;
  restoreClient: () => void;
}

export interface ILoginResponse {
  success: boolean;
  client?: ReturnType<typeof sdk.createClient>;
}