"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { getCookie } from "@/tools/cookie.tool";
import { waitForClientReady } from "@/lib/matrix";
import { createUserInfo } from "@/utils/createUserInfo";
import { useRouter } from "next/navigation";
import { PresenceProvider } from "@/contexts/PresenceProvider";

const HOMESERVER_URL =
  process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);

  useEffect(() => {
    let isMounted = true;
    const setupClient = async () => {
      const accessToken = getCookie("matrix_access_token");
      const userId = getCookie("matrix_user_id");
      const deviceId = getCookie("matrix_device_id");

      console.log(accessToken, userId, deviceId);

      if (!accessToken || !userId || !deviceId) return;

      try {
        const client = sdk.createClient({
          baseUrl: HOMESERVER_URL,
          accessToken,
          userId,
          deviceId
        });

        client.startClient();

        await waitForClientReady(client);

        createUserInfo(client);

        if (isMounted) setClient(client)
      } catch (error: any) {
        if (client) {
          client.stopClient();
        }
      }
    };

    setupClient();

    return () => {
      isMounted = false;
      if (client) {
        client.stopClient();
      }
    };
  }, [HOMESERVER_URL, router]);

  return (
    <MatrixClientContext.Provider value={client}>
      <PresenceProvider>{children}</PresenceProvider>
    </MatrixClientContext.Provider>
  );
}
