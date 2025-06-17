"use client"

import * as sdk from "matrix-js-sdk"

export const sendReadReceipt = async (client: sdk.MatrixClient, event: any) => {
    if (!client || !event || typeof event.getId !== "function" || typeof event.getRoomId !== "function" 
        || !event.getId() || !event.getRoomId()) return;
    try {
        await client.sendReadReceipt(event);
    } catch (err) {
        // Có thể log lỗi hoặc xử lý theo ý bạn
        console.error("Failed to send read receipt:", err);
    }
};