/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useClientStore } from "@/stores/useClientStore";
import { MatrixAuthService } from "./matrixAuthService";
import * as sdk from "matrix-js-sdk";
import { Message } from "@/stores/useChatStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

const authServie = new MatrixAuthService();

const { userId, token } = authServie.getCurrentUser();

const getClient = async (): Promise<sdk.MatrixClient | null> => {
  const store = useClientStore.getState();
  
  if (store.client) return store.client;
  
  if (!token || !userId) return null;
  
  const authedClient = sdk.createClient({
    baseUrl: "https://matrix.org",
    accessToken: token,
    userId: userId,
  });
  
  store.setClient(authedClient);

  await new Promise<void>((resolve) => {
    authedClient.once("sync" as any, (state: string) => {
      if (state === "PREPARED") resolve();
    });
    authedClient.startClient();
  });

  return authedClient;
};
 
export const getUserRooms = async (client: sdk.MatrixClient): Promise<{
  success: boolean;
  err?: any;
  rooms?: sdk.Room[];
}> => {
  if (!client) {
    return {
      success: false,
      err: "Client could not be authenticated",
    };
  }

  try {
    const rooms = client.getRooms ? client.getRooms() : [];
    console.clear();
    console.log(
      "%cGet User room list successful --> Number Of Rooms: " + rooms.length,
      "color: green"
    );
    return {
      success: true,
      rooms,
    };
  } catch (error: any) {
    return {
      success: false,
      err: error?.message,
    };
  }
};

export const sendMessage = async (
  roomId: string,
  message: string,
  client: sdk.MatrixClient
): Promise<{
  success: boolean;
  err?: any;
}> => {
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }
  const txtId = "mgs_" + Date.now();
  try {
    await client.sendTextMessage(roomId, message, txtId);

    return {
      success: true,
    };
  } catch (error) {
    return { success: false, err: error };
  }
};

export const getTimeline = async (
  roomId: string,
  client: sdk.MatrixClient
): Promise<{
  success: boolean;
  err?: any;
  timeline?: Message[];
}> => {
  if (!client) {
    return {
      success: false,
      err: "User not authenticated or session invalid.",
    };
  }

  try {
    const messages = client?.getRoom(roomId)?.getLiveTimeline().getEvents().slice(-20) || [];
    if (messages) {
      const res: Message[] = [];
      messages.map((event) => {
        if (event.getType() === "m.room.message") {
          const sender = event.getSender() ?? "Unknown";
          const content = event.getContent();
          const text = content.body;
          const senderDisplayName = event.sender?.name ?? sender;

          const timestamp = event.getTs(); // -> timestamp dạng milliseconds (Unix time)

          const time = new Date(timestamp).toLocaleString(); // chuyển sang định dạng dễ đọc

          const eventId = event.getId() || "";

          res.push({ eventId, time, senderDisplayName, sender, text });
        }
      });
      return {
        success: true,
        timeline: res,
      };
    } else {
      return {
        success: false,
        err: "Failed to load timeline message",
      };
    }
  } catch (error) {
    return { success: false, err: error };
  }
};
