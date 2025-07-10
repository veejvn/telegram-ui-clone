"use client"
import * as sdk from "matrix-js-sdk"
import { useUserStore } from "@/stores/useUserStore"
import { useAuthStore } from "@/stores/useAuthStore";
import { normalizeMatrixUserId } from "@/utils/matrixHelpers";

export function createUserInfo(client: sdk.MatrixClient) {
    const { setUser } = useUserStore.getState();
    const userId = client.getUserId();
    const user = client.getUser(userId ?? "");
    const homeserver = client.getHomeserverUrl();
    const displayName = user?.displayName || decodeMatrixUserId(userId) || "Unknown";
    const status = "online";

    setUser({
        displayName,
        status,
        homeserver
    });
}

function decodeMatrixUserId(userId : string | null) {
    return userId?.replace(/=40/g, "@");
  }