"use client"

import * as sdk from "matrix-js-sdk";

export interface IClientState {
  client: sdk.MatrixClient | null;
  setClient: (client: sdk.MatrixClient) => void;
  clearCLient: () => void;
}

export interface ILoginResponse {
  success: boolean;
  token: string;
  userId: string;
}