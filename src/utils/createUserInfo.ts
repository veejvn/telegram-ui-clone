"use client"
import * as sdk from "matrix-js-sdk"
import { useUserStore } from "@/stores/useUserStore"

export function createUserInfo(client: sdk.MatrixClient) {
    const { setUser } = useUserStore.getState()
    const userId = client.getUserId();
    const user = client.getUser(userId ?? "");

    const displayName = user?.displayName || userId || "Unknown";

    setUser({
        displayName,
    });
}