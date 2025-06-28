"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as sdk from "matrix-js-sdk";
import { getLS } from "@/tools/localStorage.tool";
import { waitForClientReady } from "@/lib/matrix";
import { createUserInfo } from "@/utils/createUserInfo";

const HOMESERVER_URL =
  process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);

  useEffect(() => {
    let isMounted = true;
    const setupClient = async () => {
      const accessToken = getLS("matrix_access_token");
      const userId = getLS("matrix_user_id");
      const deviceId = getLS("matrix_device_id"); // <-- thêm dòng này

      if (!accessToken || !userId || !deviceId) return;

      const client = sdk.createClient({
        baseUrl: HOMESERVER_URL,
        accessToken,
        userId,
        deviceId,
      });

      client.startClient();

      await waitForClientReady(client);

      createUserInfo(client);

      if (isMounted) setClient(client);
    };

    setupClient();

    return () => {
      isMounted = false;
      if (client) {
        client.stopClient();
      }
    };
  }, []);

  return (
    <MatrixClientContext.Provider value={client}>
      {children}
    </MatrixClientContext.Provider>
  );
}
