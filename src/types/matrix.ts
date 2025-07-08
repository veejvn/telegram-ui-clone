"use client"

import * as sdk from "@/lib/matrix-sdk";

// Re-export commonly used Matrix types
export type MatrixClient = sdk.MatrixClient;
export type Room = sdk.Room;
export type MatrixEvent = sdk.MatrixEvent;
export type RoomMember = sdk.RoomMember;

export interface IClientState {
  client: sdk.MatrixClient | null;
  setClient: (client: sdk.MatrixClient) => void;
  clearCLient: () => void;
}

export interface ILoginResponse {
  success: boolean;
  token: string;
  userId: string;
  deviceId?: string;
}

export interface IMatrixUser {
  displayName?: string;
  userId: string;
  avatarUrl?: string;
}