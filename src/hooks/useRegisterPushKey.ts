"use client"

import { useEffect } from "react";

const useRegisterPushKey = (accessToken: string | null) => {

  const PUSH_TOKEN_DOMAIN = process.env.NEXT_PUBLIC_PUSH_TOKEN_DOMAIN  || ""

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pushConfigs = [
      { tokenKey: "pushToken", profileTag: "fcm" },
      { tokenKey: "voipToken", profileTag: "voip" },
    ];

    pushConfigs.forEach(({ tokenKey, profileTag }) => {
      let pushToken = localStorage.getItem(tokenKey);
      if (pushToken && pushToken.startsWith('"') && pushToken.endsWith('"')) {
        pushToken = JSON.parse(pushToken);
      }
      if (pushToken && accessToken){
        //console.log(pushToken, profileTag)
    
        const payload = {
          app_display_name: "Ting Tong",
          app_id: "ting.tong.app",
          device_display_name: "Ting Tong",
          kind: "http",
          lang: "en_US",
          pushkey: pushToken,
          profile_tag: profileTag,
        };
  
        //console.log(payload)
    
        fetch(PUSH_TOKEN_DOMAIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Token từ client chat
          },
          body: JSON.stringify(payload),
        })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Pushkey registration failed: ${errorText}`);
          }
          return res.json();
        })
        .then((data) => {
          //console.log("Pushkey registered:", data);
        })
        .catch((err) => {
          console.error("Pushkey error:", err);
        });
      }
    })
  }, [accessToken]);
};

export default useRegisterPushKey;
