"use client"

import { getLS, setLS } from "@/tools/localStorage.tool";
import { useEffect } from "react";

const useRegisterPushKey = (accessToken: string | null) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pushToken = getLS("pushToken");
    //console.log("pushToken", pushToken)
    if (!pushToken) return;

    const lastRegistered = getLS("lastPushToken");
    if (lastRegistered === pushToken) return;

    const payload = {
      app_display_name: "Ting Tong",
      app_id: "ting.tong.app",
      device_display_name: "Ting Tong",
      kind: "http",
      lang: "en_US",
      pushkey: pushToken,
    };

    fetch("https://matrix-synapse-service.blocktrend.xyz/api/v1/pushers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Token từ client chat
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Pushkey registration failed");
        return res.json();
      })
      .then((data) => {
        setLS("lastPushToken", pushToken);
        console.log("Pushkey registered:", data);
      })
      .catch((err) => {
        console.error("Pushkey error:", err);
      });
  }, [accessToken]);
};

export default useRegisterPushKey;
